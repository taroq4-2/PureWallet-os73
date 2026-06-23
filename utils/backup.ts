/**
 * Encrypted Backup Module
 * ─────────────────────────────────────────────────────────────────────────
 * Exports the full transaction database as an encrypted base64 string shared
 * via the system Share sheet.  Encryption uses XOR with a 256-byte key stored
 * in the device's Secure Store (Keychain / Android Keystore).
 *
 * Export : transactions → JSON → encrypt → base64 → Share sheet
 * Import : paste backup text → base64 decode → decrypt → transactions
 */
import * as SecureStore from "expo-secure-store";
import { Alert, Share } from "react-native";
import type { StoredTransaction } from "./storage";

const KEY_STORE_ID = "pw_backup_key_v1";
const BACKUP_MAGIC = "PWBK01";
const BACKUP_PREFIX = "[PureWallet Backup] ";

async function getOrCreateBackupKey(): Promise<number[]> {
  const stored = await SecureStore.getItemAsync(KEY_STORE_ID);
  if (stored) return JSON.parse(stored) as number[];
  const key: number[] = Array.from({ length: 256 }, () =>
    Math.floor(Math.random() * 256),
  );
  await SecureStore.setItemAsync(KEY_STORE_ID, JSON.stringify(key));
  return key;
}

function xorBytes(data: number[], key: number[]): number[] {
  return data.map((byte, i) => byte ^ key[i % key.length]);
}

function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function bytesToString(bytes: number[]): string {
  let str = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      str += String.fromCharCode(b);
      i += 1;
    } else if ((b & 0xe0) === 0xc0) {
      str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else {
      str += String.fromCharCode(
        ((b & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      );
      i += 3;
    }
  }
  return str;
}

function bytesToBase64(bytes: number[]): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? chars[((b1 & 0xf) << 2) | (b2 >> 6)] : "=";
    result += i + 2 < bytes.length ? chars[b2 & 0x3f] : "=";
  }
  return result;
}

function base64ToBytes(b64: string): number[] {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const cleaned = b64.replace(/=+$/, "");
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    const n = [0, 1, 2, 3].map((j) => chars.indexOf(cleaned[i + j] ?? "A"));
    bytes.push((n[0] << 2) | (n[1] >> 4));
    if (i + 2 < cleaned.length)
      bytes.push(((n[1] & 0xf) << 4) | (n[2] >> 2));
    if (i + 3 < cleaned.length)
      bytes.push(((n[2] & 0x3) << 6) | n[3]);
  }
  return bytes;
}

export interface BackupExportResult {
  success: boolean;
  error?: string;
}

export interface BackupImportResult {
  success: boolean;
  transactions?: StoredTransaction[];
  error?: string;
}

/**
 * Encrypts all transactions and opens the system share sheet.
 * The user can save the backup text to Notes, Email, WhatsApp, etc.
 */
export async function exportBackup(
  transactions: StoredTransaction[],
): Promise<BackupExportResult> {
  try {
    const key = await getOrCreateBackupKey();
    const payload = JSON.stringify({
      magic: BACKUP_MAGIC,
      v: 1,
      data: transactions,
    });
    const encrypted = xorBytes(stringToBytes(payload), key);
    const b64 = BACKUP_PREFIX + bytesToBase64(encrypted);
    await Share.share({
      message: b64,
      title: "نسخة احتياطية - PureWallet",
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Prompts the user to paste their backup text, then decrypts and restores transactions.
 * Shows a native Alert with a text input (iOS) or a JS-layer input prompt (Android).
 */
export function importBackup(
  onResult: (result: BackupImportResult) => void,
): void {
  Alert.prompt(
    "استيراد نسخة احتياطية",
    "الصق نص النسخة الاحتياطية هنا:",
    [
      { text: "إلغاء", style: "cancel", onPress: () => onResult({ success: false, error: "cancelled" }) },
      {
        text: "استيراد",
        onPress: async (text?: string) => {
          if (!text?.startsWith(BACKUP_PREFIX)) {
            onResult({ success: false, error: "invalid_format" });
            return;
          }
          try {
            const b64 = text.slice(BACKUP_PREFIX.length);
            const key = await getOrCreateBackupKey();
            const decrypted = xorBytes(base64ToBytes(b64), key);
            const json = bytesToString(decrypted);
            const parsed = JSON.parse(json) as {
              magic: string;
              v: number;
              data: StoredTransaction[];
            };
            if (parsed.magic !== BACKUP_MAGIC) {
              onResult({ success: false, error: "invalid_file" });
              return;
            }
            onResult({ success: true, transactions: parsed.data });
          } catch (e) {
            onResult({
              success: false,
              error: e instanceof Error ? e.message : String(e),
            });
          }
        },
      },
    ],
    "plain-text",
  );
}
