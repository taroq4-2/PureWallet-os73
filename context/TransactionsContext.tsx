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
  isSeeded,
  loadMerchantMap,
  loadTransactions,
  markSeeded,
  saveMerchantMap,
  saveTransactions,
} from "@/utils/storage";

const now = Date.now();
const d = (days: number) => now - days * 86_400_000;
const h = (hours: number) => now - hours * 3_600_000;

const SEED: StoredTransaction[] = [
  { id: "s1",  bankName: "بنك الراجحي",           amount: 152.50, merchantName: "بنده سوبر ماركت",    timestamp: d(3),  categoryId: "groceries",    isManual: false },
  { id: "s2",  bankName: "البنك الأهلي السعودي",  amount: 45.00,  merchantName: "ستاربكس",            timestamp: d(2),  categoryId: "cafes",        isManual: false },
  { id: "s3",  bankName: "بنك الراجحي",           amount: 200.00, merchantName: "محطة شل",            timestamp: d(4),  categoryId: "fuel",         isManual: false },
  { id: "s4",  bankName: "بنك الرياض",            amount: 89.50,  merchantName: "جرير",              timestamp: d(5),  categoryId: "shopping",     isManual: false },
  { id: "s5",  bankName: "بنك الراجحي",           amount: 120.00, merchantName: "كارفور",             timestamp: d(7),  categoryId: "groceries",    isManual: false },
  { id: "s6",  bankName: "البنك الأهلي السعودي",  amount: 35.00,  merchantName: "كوستا كافيه",        timestamp: d(6),  categoryId: "cafes",        isManual: false },
  { id: "s7",  bankName: "بنك ساب",               amount: 450.00, merchantName: "متجر إلكتروني جديد", timestamp: h(1),  categoryId: "uncategorized",isManual: false },
  { id: "s8",  bankName: "بنك الرياض",            amount: 75.00,  merchantName: "ماكدونالدز",         timestamp: d(1),  categoryId: "restaurants",  isManual: false },
  { id: "s9",  bankName: "بنك الراجحي",           amount: 180.00, merchantName: "لولو هايبر ماركت",  timestamp: d(14), categoryId: "groceries",    isManual: false },
  { id: "s10", bankName: "البنك الأهلي السعودي",  amount: 95.00,  merchantName: "متجر XYZ",           timestamp: h(2),  categoryId: "uncategorized",isManual: false },
  { id: "s11", bankName: "بنك البلاد",            amount: 320.00, merchantName: "صيدلية النهدي",      timestamp: d(8),  categoryId: "health",       isManual: false },
  { id: "s12", bankName: "بنك الراجحي",           amount: 58.00,  merchantName: "نتفليكس",            timestamp: d(10), categoryId: "entertainment", isManual: false },
];

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
      const seeded = await isSeeded();
      const stored = await loadTransactions();
      const map    = await loadMerchantMap();

      if (!seeded || stored.length === 0) {
        await saveTransactions(SEED);
        await markSeeded();
        setTransactions(SEED);
      } else {
        setTransactions(stored);
      }
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
