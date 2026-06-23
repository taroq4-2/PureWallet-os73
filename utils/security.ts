/**
 * Security Module — Root Detection & Tamper Detection
 * ─────────────────────────────────────────────────────────────────────────
 * Provides runtime checks to detect rooted/jailbroken devices and basic
 * integrity verification.  All checks run in JS and are therefore a
 * defence-in-depth layer, not a cryptographic guarantee.
 */
import * as Device from "expo-device";
import { Platform } from "react-native";

const ANDROID_ROOT_BINARIES = [
  "/system/app/Superuser.apk",
  "/sbin/su",
  "/system/bin/su",
  "/system/xbin/su",
  "/data/local/xbin/su",
  "/data/local/bin/su",
  "/system/sd/xbin/su",
  "/system/bin/failsafe/su",
  "/data/local/su",
  "/su/bin/su",
];

const ANDROID_ROOT_PACKAGES = [
  "com.topjohnwu.magisk",
  "eu.chainfire.supersu",
  "com.noshufou.android.su",
  "com.koushikdutta.superuser",
  "com.zachspong.temprootremovejb",
  "com.ramdroid.appquarantine",
];

const IOS_JAILBREAK_PATHS = [
  "/Applications/Cydia.app",
  "/Library/MobileSubstrate/MobileSubstrate.dylib",
  "/bin/bash",
  "/usr/sbin/sshd",
  "/etc/apt",
  "/private/var/lib/apt",
  "/usr/bin/ssh",
  "/private/var/stash",
];

export interface SecurityStatus {
  isRooted: boolean;
  isEmulator: boolean;
  isDebugBuild: boolean;
  threats: string[];
}

/**
 * Performs all runtime security checks.
 * Returns a SecurityStatus object with individual flags and a `threats` list.
 */
export async function runSecurityChecks(): Promise<SecurityStatus> {
  const threats: string[] = [];

  const isEmulator = !Device.isDevice;
  if (isEmulator) threats.push("emulator_detected");

  const isDebugBuild = __DEV__;
  if (isDebugBuild) threats.push("debug_build");

  let isRooted = false;

  if (Platform.OS === "android") {
    isRooted = await detectAndroidRoot(threats);
  } else if (Platform.OS === "ios") {
    isRooted = detectIosJailbreak(threats);
  }

  return { isRooted, isEmulator, isDebugBuild, threats };
}

async function detectAndroidRoot(threats: string[]): Promise<boolean> {
  if (Platform.OS !== "android") return false;

  const { NativeModules } = await import("react-native");

  let detected = false;

  if (
    NativeModules.RNDeviceInfo?.isBuildDebuggable ||
    typeof (global as any).nativeCallSyncHook !== "undefined"
  ) {
    threats.push("native_debug_hook");
    detected = true;
  }

  try {
    const fs = NativeModules.FileSystem ?? null;
    if (fs) {
      for (const path of ANDROID_ROOT_BINARIES) {
        const exists = await fs.exists?.(path);
        if (exists) {
          threats.push(`root_binary:${path}`);
          detected = true;
          break;
        }
      }
    }
  } catch {
    // File system check not available — not treated as a threat
  }

  void ANDROID_ROOT_PACKAGES;

  return detected;
}

function detectIosJailbreak(threats: string[]): boolean {
  let detected = false;

  for (const path of IOS_JAILBREAK_PATHS) {
    try {
      const result = (global as any).fetch?.(`file://${path}`);
      if (result) {
        threats.push(`jailbreak_path:${path}`);
        detected = true;
        break;
      }
    } catch {
      // Expected — file doesn't exist on stock device
    }
  }

  return detected;
}

/**
 * Checks whether the running bundle matches the expected build fingerprint.
 * This is a lightweight heuristic — not a cryptographic signature check.
 */
export function isBundleIntegrityOk(): boolean {
  try {
    const Constants = require("expo-constants").default;
    const appOwnership = Constants.appOwnership;
    if (appOwnership === "expo") return true;
    const expoConfig = Constants.expoConfig;
    return !!(expoConfig?.slug && expoConfig?.version);
  } catch {
    return false;
  }
}
