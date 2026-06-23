import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_LAST_SCAN = "@pw_sms_last_scan_v1";
const KEY_SEEN_IDS  = "@pw_sms_seen_ids_v1";
const MAX_SEEN_IDS  = 2000;

export async function getSmsLastScan(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST_SCAN);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function setSmsLastScan(ts: number): Promise<void> {
  await AsyncStorage.setItem(KEY_LAST_SCAN, String(ts));
}

export async function getSmsSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SEEN_IDS);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function markSmsAsSeen(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const existing = await getSmsSeenIds();
  for (const id of ids) existing.add(id);
  const arr = Array.from(existing).slice(-MAX_SEEN_IDS);
  await AsyncStorage.setItem(KEY_SEEN_IDS, JSON.stringify(arr));
}

export async function clearSmsState(): Promise<void> {
  await AsyncStorage.multiRemove([KEY_LAST_SCAN, KEY_SEEN_IDS]);
}