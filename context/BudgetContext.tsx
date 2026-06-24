import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useTransactions } from "./TransactionsContext";

const KEY_BUDGET_LIMITS = "@pw_budget_limits_v1";

export type BudgetLimits = Record<string, number>;

interface BudgetCtx {
  budgetLimits: BudgetLimits;
  setBudgetLimit: (categoryId: string, amount: number) => Promise<void>;
  clearBudgetLimit: (categoryId: string) => Promise<void>;
  applyAutoSuggest: () => Promise<void>;
  autoSuggestLimits: () => BudgetLimits;
  totalBudget: number;
  totalSpentThisMonth: number;
  categorySpending: Record<string, number>;
}

const BudgetContext = createContext<BudgetCtx | null>(null);

function getMonthBounds(monthOffset = 0): { start: number; end: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getTime();
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset + 1,
    0,
    23,
    59,
    59,
    999,
  ).getTime();
  return { start, end };
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useTransactions();
  const [budgetLimits, setBudgetLimitsState] = useState<BudgetLimits>({});

  useEffect(() => {
    AsyncStorage.getItem(KEY_BUDGET_LIMITS).then((raw) => {
      if (raw) setBudgetLimitsState(JSON.parse(raw) as BudgetLimits);
    });
  }, []);

  const saveLimits = useCallback(async (limits: BudgetLimits) => {
    setBudgetLimitsState(limits);
    await AsyncStorage.setItem(KEY_BUDGET_LIMITS, JSON.stringify(limits));
  }, []);

  const setBudgetLimit = useCallback(
    async (categoryId: string, amount: number) => {
      await saveLimits({ ...budgetLimits, [categoryId]: amount });
    },
    [budgetLimits, saveLimits],
  );

  const clearBudgetLimit = useCallback(
    async (categoryId: string) => {
      const next = { ...budgetLimits };
      delete next[categoryId];
      await saveLimits(next);
    },
    [budgetLimits, saveLimits],
  );

  const categorySpending = useMemo(() => {
    const cur = getMonthBounds(0);
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (t.timestamp < cur.start || t.timestamp > cur.end) continue;
      if (t.categoryId === "uncategorized") continue;
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    }
    return map;
  }, [transactions]);

  const totalSpentThisMonth = useMemo(
    () => Object.values(categorySpending).reduce((s, v) => s + v, 0),
    [categorySpending],
  );

  const totalBudget = useMemo(
    () => Object.values(budgetLimits).reduce((s, v) => s + v, 0),
    [budgetLimits],
  );

  const autoSuggestLimits = useCallback((): BudgetLimits => {
    const totals: Record<string, number> = {};
    const months = 3;
    for (let offset = -months; offset < 0; offset++) {
      const bounds = getMonthBounds(offset);
      for (const t of transactions) {
        if (t.timestamp < bounds.start || t.timestamp > bounds.end) continue;
        if (t.categoryId === "uncategorized") continue;
        totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
      }
    }
    const result: BudgetLimits = {};
    for (const [cat, total] of Object.entries(totals)) {
      const avg = total / months;
      if (avg > 0) {
        result[cat] = Math.max(50, Math.ceil(avg / 50) * 50);
      }
    }
    return result;
  }, [transactions]);

  const applyAutoSuggest = useCallback(async () => {
    const suggested = autoSuggestLimits();
    if (Object.keys(suggested).length > 0) {
      await saveLimits(suggested);
    }
  }, [autoSuggestLimits, saveLimits]);

  return (
    <BudgetContext.Provider
      value={{
        budgetLimits,
        setBudgetLimit,
        clearBudgetLimit,
        applyAutoSuggest,
        autoSuggestLimits,
        totalBudget,
        totalSpentThisMonth,
        categorySpending,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetCtx {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be inside BudgetProvider");
  return ctx;
}