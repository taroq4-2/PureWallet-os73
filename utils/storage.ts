import AsyncStorage from "@react-native-async-storage/async-storage";

export const TRANSACTIONS_KEY = "@purewallet/transactions_v2";
export const MERCHANT_MAP_KEY  = "@purewallet/merchant_categories_v2";
export const SEEDED_KEY        = "@purewallet/seeded_v2";

export interface StoredTransaction {
  id: string;
  bankName: string;
  amount: number;
  merchantName: string;
  timestamp: number;
  categoryId: string;
  isManual: boolean;
}

export type MerchantCategoryMap = Record<string, string>;

export async function loadTransactions(): Promise<StoredTransaction[]> {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return raw ? (JSON.parse(raw) as StoredTransaction[]) : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(items: StoredTransaction[]): Promise<void> {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(items));
}

export async function loadMerchantMap(): Promise<MerchantCategoryMap> {
  try {
    const raw = await AsyncStorage.getItem(MERCHANT_MAP_KEY);
    return raw ? (JSON.parse(raw) as MerchantCategoryMap) : {};
  } catch {
    return {};
  }
}

export async function saveMerchantMap(map: MerchantCategoryMap): Promise<void> {
  await AsyncStorage.setItem(MERCHANT_MAP_KEY, JSON.stringify(map));
}

export async function isSeeded(): Promise<boolean> {
  return (await AsyncStorage.getItem(SEEDED_KEY)) === "1";
}

export async function markSeeded(): Promise<void> {
  await AsyncStorage.setItem(SEEDED_KEY, "1");
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([TRANSACTIONS_KEY, MERCHANT_MAP_KEY, SEEDED_KEY]);
}
