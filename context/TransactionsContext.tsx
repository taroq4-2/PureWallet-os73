import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

export interface MonthStats {
  total: number;
  previousTotal: number;
  changePercent: number;
  byCategory: { categoryId: string; amount: number; count: number }[];
}

interface Ctx {
  transactions: StoredTransaction[];
  merchantMap: MerchantCategoryMap;
  loading: boolean;
  uncategorizedCount: number;
  monthStats: MonthStats;
  addTransaction: (t: Omit<StoredTransaction, "id">) => Promise<void>;
  categorize: (id: string, categoryId: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const TransactionsContext = createContext<Ctx | null>(null);

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1).getTime();
  const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59).getTime();
  return { start, end };
}

function computeMonthStats(transactions: StoredTransaction[]): MonthStats {
  const cur  = getMonthRange(0);
  const prev = getMonthRange(-1);

  const curTx  = transactions.filter((t) => t.timestamp >= cur.start  && t.timestamp <= cur.end);
  const prevTx = transactions.filter((t) => t.timestamp >= prev.start && t.timestamp <= prev.end);

  const total         = curTx.reduce((s, t) => s + t.amount, 0);
  const previousTotal = prevTx.reduce((s, t) => s + t.amount, 0);
  const changePercent = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  const map: Record<string, { amount: number; count: number }> = {};
  for (const t of curTx) {
    if (t.categoryId === "uncategorized") continue;
    if (!map[t.categoryId]) map[t.categoryId] = { amount: 0, count: 0 };
    map[t.categoryId].amount += t.amount;
    map[t.categoryId].count  += 1;
  }

  const byCategory = Object.entries(map)
    .map(([categoryId, v]) => ({ categoryId, ...v }))
    .sort((a, b) => b.amount - a.amount);

  return { total, previousTotal, changePercent, byCategory };
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [merchantMap, setMerchantMap]   = useState<MerchantCategoryMap>({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      const [stored, map] = await Promise.all([
        loadTransactions(),
        loadMerchantMap(),
      ]);
      setTransactions(stored);
      setMerchantMap(map);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (items: StoredTransaction[], map?: MerchantCategoryMap) => {
    await saveTransactions(items);
    if (map) await saveMerchantMap(map);
  }, []);

  const addTransaction = useCallback(async (t: Omit<StoredTransaction, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const next = [{ ...t, id }, ...transactions];
    setTransactions(next);
    await persist(next);
  }, [transactions, persist]);

  const categorize = useCallback(async (id: string, categoryId: string) => {
    const next = transactions.map((t) => (t.id === id ? { ...t, categoryId } : t));
    const tx = next.find((t) => t.id === id);
    const newMap = { ...merchantMap };
    if (tx) newMap[tx.merchantName] = categoryId;
    setTransactions(next);
    setMerchantMap(newMap);
    await persist(next, newMap);
  }, [transactions, merchantMap, persist]);

  const deleteTransaction = useCallback(async (id: string) => {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    await persist(next);
  }, [transactions, persist]);

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
      value={{ transactions, merchantMap, loading, uncategorizedCount, monthStats, addTransaction, categorize, deleteTransaction, clearAllData }}
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
