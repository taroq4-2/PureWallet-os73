import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MerchantCategoryMap,
  StoredTransaction,
  clearAll,
  loadMerchantMap,
  loadTransactions,
  saveMerchantMap,
  saveTransactions,
} from "@/utils/storage";
import { normalizeMerchantName } from "@/utils/validation";
import { generateUUID } from "@/utils/uuid";

export interface MonthStats {
  total: number;
  previousTotal: number;
  changePercent: number;
  byCategory: { categoryId: string; amount: number; count: number }[];
}

export interface SmsTransactionInput {
  bankName: string;
  amount: number;
  merchantName: string;
  timestamp: number;
  smsId: string;
}

interface Ctx {
  transactions: StoredTransaction[];
  merchantMap: MerchantCategoryMap;
  loading: boolean;
  uncategorizedCount: number;
  monthStats: MonthStats;
  addTransaction: (t: Omit<StoredTransaction, "id" | "normalizedMerchant">) => Promise<void>;
  categorize: (id: string, categoryId: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  importSmsTransactions: (txs: SmsTransactionInput[]) => Promise<number>;
}

const TransactionsContext = createContext<Ctx | null>(null);

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59).getTime();
  return { start, end };
}

function computeMonthStats(transactions: StoredTransaction[]): MonthStats {
  const cur = getMonthRange(0);
  const prev = getMonthRange(-1);

  const curTx = transactions.filter((t) => t.timestamp >= cur.start && t.timestamp <= cur.end);
  const prevTx = transactions.filter((t) => t.timestamp >= prev.start && t.timestamp <= prev.end);

  const total = curTx.reduce((s, t) => s + t.amount, 0);
  const previousTotal = prevTx.reduce((s, t) => s + t.amount, 0);
  const changePercent = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  const map: Record<string, { amount: number; count: number }> = {};
  for (const t of curTx) {
    if (t.categoryId === "uncategorized") continue;
    if (!map[t.categoryId]) map[t.categoryId] = { amount: 0, count: 0 };
    map[t.categoryId].amount += t.amount;
    map[t.categoryId].count += 1;
  }

  const byCategory = Object.entries(map)
    .map(([categoryId, v]) => ({ categoryId, ...v }))
    .sort((a, b) => b.amount - a.amount);

  return { total, previousTotal, changePercent, byCategory };
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [merchantMap, setMerchantMap] = useState<MerchantCategoryMap>({});
  const [loading, setLoading] = useState(true);

  const pendingRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    (async () => {
      const [stored, map] = await Promise.all([loadTransactions(), loadMerchantMap()]);
      setTransactions(stored);
      setMerchantMap(map);
      setLoading(false);
    })();
  }, []);

  const enqueue = useCallback((fn: () => Promise<void>) => {
    pendingRef.current = pendingRef.current.then(fn).catch(() => {});
    return pendingRef.current;
  }, []);

  const addTransaction = useCallback(
    async (t: Omit<StoredTransaction, "id" | "normalizedMerchant">) => {
      const id = generateUUID();
      const normalizedMerchant = normalizeMerchantName(t.merchantName);
      const newTx: StoredTransaction = { ...t, id, normalizedMerchant };

      setTransactions((prev) => {
        const next = [newTx, ...prev];
        enqueue(() => saveTransactions(next));
        return next;
      });
    },
    [enqueue],
  );

  const importSmsTransactions = useCallback(
    async (txs: SmsTransactionInput[]): Promise<number> => {
      if (txs.length === 0) return 0;

      return new Promise<number>((resolve) => {
        setTransactions((prev) => {
          const existingSmsIds = new Set(prev.map((t) => t.smsId).filter(Boolean));
          const toAdd: StoredTransaction[] = [];

          for (const tx of txs) {
            if (existingSmsIds.has(tx.smsId)) continue;
            const id = generateUUID();
            const normalizedMerchant = normalizeMerchantName(tx.merchantName);
            const categoryId = "uncategorized";
            toAdd.push({
              id,
              normalizedMerchant,
              categoryId,
              isManual: false,
              ...tx,
            });
          }

          if (toAdd.length === 0) {
            resolve(0);
            return prev;
          }

          const next = [...toAdd, ...prev].sort((a, b) => b.timestamp - a.timestamp);
          enqueue(() => saveTransactions(next));
          resolve(toAdd.length);
          return next;
        });
      });
    },
    [enqueue],
  );

  const categorize = useCallback(
    async (id: string, categoryId: string) => {
      setTransactions((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, categoryId } : t));
        const tx = next.find((t) => t.id === id);

        setMerchantMap((prevMap) => {
          if (!tx) return prevMap;
          const newMap = { ...prevMap, [tx.normalizedMerchant]: categoryId };
          enqueue(() => Promise.all([saveTransactions(next), saveMerchantMap(newMap)]).then(() => {}));
          return newMap;
        });

        return next;
      });
    },
    [enqueue],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        enqueue(() => saveTransactions(next));
        return next;
      });
    },
    [enqueue],
  );

  const clearAllData = useCallback(async () => {
    await clearAll();
    setTransactions([]);
    setMerchantMap({});
  }, []);

  const uncategorizedCount = useMemo(
    () => transactions.filter((t) => t.categoryId === "uncategorized").length,
    [transactions],
  );

  const monthStats = useMemo(() => computeMonthStats(transactions), [transactions]);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        merchantMap,
        loading,
        uncategorizedCount,
        monthStats,
        addTransaction,
        categorize,
        deleteTransaction,
        clearAllData,
        importSmsTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): Ctx {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be inside TransactionsProvider");
  return ctx;
}