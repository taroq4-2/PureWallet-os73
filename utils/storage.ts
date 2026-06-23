import AsyncStorage from "@react-native-async-storage/async-storage";

import { Mutex } from "./mutex";
import { normalizeMerchantName } from "./validation";

const KEYS = {
  TRANSACTIONS: "pw_transactions_v2",
  MERCHANT_MAP: "pw_merchant_map_v2",
  STATS_CACHE: "pw_stats_cache_v2",
} as const;

const writeMutex = new Mutex();

export interface StoredTransaction {
  id: string;
  bankName: string;
  amount: number;
  merchantName: string;
  normalizedMerchant: string;
  timestamp: number;
  categoryId: string;
  isManual: boolean;
  smsId?: string;
}

export type MerchantCategoryMap = Record<string, string>;

export interface StatsCache {
  data: string;
  updatedAt: number;
  monthKey: string;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function loadTransactions(): Promise<StoredTransaction[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredTransaction[];
    return parsed.map((t) => ({
      ...t,
      normalizedMerchant: t.normalizedMerchant ?? normalizeMerchantName(t.merchantName),
      isManual: t.isManual ?? false,
    }));
  } catch {
    return [];
  }
}

export async function saveTransactions(items: StoredTransaction[]): Promise<void> {
  await writeMutex.run(async () => {
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(items));
  });
}

export async function loadMerchantMap(): Promise<MerchantCategoryMap> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MERCHANT_MAP);
    if (!raw) return {};
    return JSON.parse(raw) as MerchantCategoryMap;
  } catch {
    return {};
  }
}

export async function saveMerchantMap(map: MerchantCategoryMap): Promise<void> {
  await writeMutex.run(async () => {
    await AsyncStorage.setItem(KEYS.MERCHANT_MAP, JSON.stringify(map));
  });
}

export async function loadStatsCache(): Promise<StatsCache | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STATS_CACHE);
    if (!raw) return null;
    const cache = JSON.parse(raw) as StatsCache;
    const currentMonth = getCurrentMonthKey();
    if (cache.monthKey !== currentMonth) return null;
    if (Date.now() - cache.updatedAt > 5 * 60 * 1000) return null;
    return cache;
  } catch {
    return null;
  }
}

export async function saveStatsCache(data: string): Promise<void> {
  const cache: StatsCache = {
    data,
    updatedAt: Date.now(),
    monthKey: getCurrentMonthKey(),
  };
  await AsyncStorage.setItem(KEYS.STATS_CACHE, JSON.stringify(cache));
}

export async function clearAll(): Promise<void> {
  await writeMutex.run(async () => {
    await AsyncStorage.multiRemove([
      KEYS.TRANSACTIONS,
      KEYS.MERCHANT_MAP,
      KEYS.STATS_CACHE,
    ]);
  });
}