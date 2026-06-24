/**
 * useSmsImport
 * ─────────────────────────────────────────────────────────
 * Reads SMS messages from the Android inbox, filters for
 * known bank senders, parses them, and imports them as
 * transactions into the context (deduplicating by timestamp+amount).
 *
 * Android only — returns a no-op on other platforms.
 */
import { useCallback, useState } from "react";
import { Alert, NativeModules, PermissionsAndroid, Platform } from "react-native";

import { useTransactions } from "@/context/TransactionsContext";
import { ALL_BANK_SENDERS, isKnownBankSender, parseSms } from "@/utils/smsParser";
import { getCategoryByMerchant } from "@/utils/categories";

const { SmsAndroid } = NativeModules as {
  SmsAndroid: {
    list: (
      filter: string,
      fail: (err: string) => void,
      success: (count: number, smsList: string) => void
    ) => void;
  } | null;
};

export interface SmsMessage {
  _id: string;
  address: string;
  body: string;
  date: number;
  date_sent: number;
  read: number;
  type: number;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
}

async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);
    return (
      result["android.permission.READ_SMS"] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

function readSmsInbox(maxCount = 500): Promise<SmsMessage[]> {
  return new Promise((resolve, reject) => {
    if (!SmsAndroid) {
      reject(new Error("SmsAndroid module not available"));
      return;
    }
    const filter = JSON.stringify({ box: "inbox", maxCount, indexFrom: 0 });
    SmsAndroid.list(
      filter,
      (err) => reject(new Error(err)),
      (_count, smsList) => {
        try {
          resolve(JSON.parse(smsList) as SmsMessage[]);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

export function useSmsImport() {
  const { transactions, addTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);

  const importFromInbox = useCallback(async (): Promise<ImportResult | null> => {
    if (Platform.OS !== "android") {
      Alert.alert("غير مدعوم", "استيراد الرسائل متاح على Android فقط");
      return null;
    }

    if (!SmsAndroid) {
      Alert.alert(
        "الوحدة غير متاحة",
        "وحدة قراءة الرسائل غير متوفرة. تأكد من تثبيت التطبيق من ملف APK وليس عبر Expo Go."
      );
      return null;
    }

    const granted = await requestSmsPermission();
    if (!granted) {
      Alert.alert("رفض الإذن", "يحتاج التطبيق صلاحية قراءة الرسائل لاستيراد عملياتك البنكية.");
      return null;
    }

    setLoading(true);
    try {
      const allSms = await readSmsInbox(500);

      const bankSms = allSms.filter((msg) => isKnownBankSender(msg.address || ""));

      const existingKeys = new Set(
        transactions.map((t) => `${t.timestamp}|${t.amount}`)
      );

      let imported = 0;
      let skipped = 0;

      for (const msg of bankSms) {
        const parsed = parseSms(msg.body, msg.address);
        if (!parsed) { skipped++; continue; }

        const ts = msg.date || msg.date_sent || Date.now();
        const key = `${ts}|${parsed.amount}`;
        if (existingKeys.has(key)) { skipped++; continue; }

        existingKeys.add(key);
        const categoryId = getCategoryByMerchant(parsed.merchantName);
        await addTransaction({
          bankName:     parsed.bankName,
          amount:       parsed.amount,
          merchantName: parsed.merchantName,
          timestamp:    ts,
          categoryId,
          isManual:     false,
        });
        imported++;
      }

      return { total: bankSms.length, imported, skipped };
    } finally {
      setLoading(false);
    }
  }, [transactions, addTransaction]);

  return { importFromInbox, loading };
}
