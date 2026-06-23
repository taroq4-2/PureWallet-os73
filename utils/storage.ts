/**
 * Encrypted Storage Layer
 * ─────────────────────────────────────────────────────────────────────────
 * Uses expo-secure-store which is backed by:
 *   • iOS   → Keychain (hardware-encrypted when Secure Enclave available)
 *   • Android → Android Keystore System (AES-256-GCM)
 *
 * SecureStore has a ~2 KB per-item limit, so large payloads (transactions,
 * merchant map) are chunked into 1 800-byte slices before storage.
 */
import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1_800;

const KEYS = {
  TRANSACTIONS: "pw_tx_v3",
  MERCHANT_MAP: "pw_mm_v3",
} as const;

async function secureSet(key: string, value: string): Promise<void> {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(`${key}__n`, String(chunks.length));
  await Promise.all(
    chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}__${i}`, chunk)),
  );
}

async function secureGet(key: string): Promise<string | null> {
  const countStr = await SecureStore.getItemAsync(`${key}__n`);
  if (!countStr) return null;
  const count = parseInt(countStr, 10);
  const parts = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.getItemAsync(`${key}__${i}`),
    ),
  );
  if (parts.some((p) => p === null)) return null;
  return (parts as string[]).join("");
}

async function secureDelete(key: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(`${key}__n`);
  const count = countStr ? parseInt(countStr, 10) : 0;
  await SecureStore.deleteItemAsync(`${key}__n`);
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.deleteItemAsync(`${key}__${i}`),
    ),
  );
}

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
    const raw = await secureGet(KEYS.TRANSACTIONS);
    return raw ? (JSON.parse(raw) as StoredTransaction[]) : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(items: StoredTransaction[]): Promise<void> {
  await secureSet(KEYS.TRANSACTIONS, JSON.stringify(items));
}

export async function loadMerchantMap(): Promise<MerchantCategoryMap> {
  try {
    const raw = await secureGet(KEYS.MERCHANT_MAP);
    return raw ? (JSON.parse(raw) as MerchantCategoryMap) : {};
  } catch {
    return {};
  }
}

export async function saveMerchantMap(map: MerchantCategoryMap): Promise<void> {
  await secureSet(KEYS.MERCHANT_MAP, JSON.stringify(map));
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    secureDelete(KEYS.TRANSACTIONS),
    secureDelete(KEYS.MERCHANT_MAP),
  ]);
}
