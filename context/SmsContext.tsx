import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";

import { parseSms } from "@/utils/smsParser";
import {
  getSmsLastScan,
  getSmsSeenIds,
  markSmsAsSeen,
  setSmsLastScan,
} from "@/utils/smsStorage";
import { SmsTransactionInput, useTransactions } from "./TransactionsContext";

export type SmsPermissionStatus = "unknown" | "granted" | "denied" | "blocked";

interface SmsRaw {
  _id: string;
  address: string;
  body: string;
  date: number;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface SmsCtx {
  permission: SmsPermissionStatus;
  scanning: boolean;
  lastScan: number;
  totalImported: number;
  requestPermission: () => Promise<boolean>;
  scan: () => Promise<number>;
  scanHistorical: () => Promise<number>;
}

const SmsContext = createContext<SmsCtx | null>(null);

function readInbox(minDate: number): Promise<SmsRaw[]> {
  if (Platform.OS !== "android") return Promise.resolve([]);
  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("react-native-get-sms-android") as { default: unknown };
      const SmsAndroid = mod.default as {
        list: (filter: string, onFail: () => void, onSuccess: (count: number, list: string) => void) => void;
      };
      SmsAndroid.list(
        JSON.stringify({ box: "inbox", minDate }),
        () => resolve([]),
        (_count: number, smsList: string) => {
          try {
            resolve(JSON.parse(smsList) as SmsRaw[]);
          } catch {
            resolve([]);
          }
        },
      );
    } catch {
      resolve([]);
    }
  });
}

export function SmsProvider({ children }: { children: React.ReactNode }) {
  const { importSmsTransactions } = useTransactions();
  const [permission, setPermission] = useState<SmsPermissionStatus>("unknown");
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(0);
  const [totalImported, setTotalImported] = useState(0);
  const importRef = useRef(importSmsTransactions);
  importRef.current = importSmsTransactions;

  const isAndroid = Platform.OS === "android";

  useEffect(() => {
    if (!isAndroid) return;
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS).then((ok) => {
      setPermission(ok ? "granted" : "unknown");
    });
  }, [isAndroid]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isAndroid) return false;
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "صلاحية قراءة الرسائل",
          message:
            "PureWallet يحتاج لصلاحية قراءة رسائل SMS لاستيراد العمليات المصرفية تلقائياً.\nلا تُرفع أي بيانات للإنترنت — كل المعالجة تتم على جهازك.",
          buttonNeutral: "اسألني لاحقاً",
          buttonNegative: "رفض",
          buttonPositive: "موافق",
        },
      );
      const ok = result === PermissionsAndroid.RESULTS.GRANTED;
      setPermission(
        ok
          ? "granted"
          : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? "blocked"
          : "denied",
      );
      return ok;
    } catch {
      setPermission("denied");
      return false;
    }
  }, [isAndroid]);

  const runScan = useCallback(
    async (minDate: number): Promise<number> => {
      if (!isAndroid) return 0;
      setScanning(true);
      try {
        const seenIds = await getSmsSeenIds();
        const messages = await readInbox(minDate);
        const newIds: string[] = [];
        const newTxs: SmsTransactionInput[] = [];

        for (const msg of messages) {
          if (seenIds.has(msg._id)) continue;
          newIds.push(msg._id);
          const parsed = parseSms(msg.body);
          if (parsed) {
            newTxs.push({
              bankName: parsed.bankName,
              amount: parsed.amount,
              merchantName: parsed.merchantName,
              timestamp: msg.date,
              smsId: msg._id,
            });
          }
        }

        if (newIds.length > 0) await markSmsAsSeen(newIds);

        const now = Date.now();
        await setSmsLastScan(now);
        setLastScan(now);

        if (newTxs.length > 0) {
          const added = await importRef.current(newTxs);
          setTotalImported((p) => p + added);
          return added;
        }
        return 0;
      } finally {
        setScanning(false);
      }
    },
    [isAndroid],
  );

  const scan = useCallback(async (): Promise<number> => {
    const stored = await getSmsLastScan();
    const minDate = stored > 0 ? stored : Date.now() - NINETY_DAYS_MS;
    return runScan(minDate);
  }, [runScan]);

  const scanHistorical = useCallback(
    async (): Promise<number> => runScan(Date.now() - NINETY_DAYS_MS),
    [runScan],
  );

  useEffect(() => {
    if (!isAndroid || permission !== "granted") return;
    scan();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") scan();
    });
    return () => sub.remove();
  }, [isAndroid, permission, scan]);

  return (
    <SmsContext.Provider
      value={{ permission, scanning, lastScan, totalImported, requestPermission, scan, scanHistorical }}
    >
      {children}
    </SmsContext.Provider>
  );
}

export function useSms(): SmsCtx {
  const ctx = useContext(SmsContext);
  if (!ctx) throw new Error("useSms must be inside SmsProvider");
  return ctx;
}