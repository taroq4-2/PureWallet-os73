import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEYS = {
  PIN_HASH: "pw_pin_hash",
  BIOMETRIC_ENABLED: "pw_biometric_enabled",
} as const;

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const salt = "pw_salt_2024_secure";
  let salted = 0;
  const combined = input + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    salted = (salted << 5) - salted + char;
    salted = salted & salted;
  }
  return `${Math.abs(hash).toString(16)}_${Math.abs(salted).toString(16)}`;
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Silently fail on web or unsupported platforms
  }
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Silently fail
  }
}

export async function isPinSet(): Promise<boolean> {
  const stored = await secureGet(KEYS.PIN_HASH);
  return stored !== null;
}

export async function setPin(pin: string): Promise<void> {
  const hash = simpleHash(pin);
  await secureSet(KEYS.PIN_HASH, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await secureGet(KEYS.PIN_HASH);
  if (!stored) return false;
  return stored === simpleHash(pin);
}

export async function removePin(): Promise<void> {
  await secureDelete(KEYS.PIN_HASH);
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await secureGet(KEYS.BIOMETRIC_ENABLED);
  return val === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await secureSet(KEYS.BIOMETRIC_ENABLED, enabled ? "true" : "false");
}
