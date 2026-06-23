import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

import {
  isBiometricEnabled,
  isPinSet,
  setBiometricEnabled as storeBiometricEnabled,
  setPin as storePin,
  verifyPin,
  removePin,
} from "@/utils/auth";

interface AuthCtx {
  isAuthenticated: boolean;
  pinSet: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  authenticate: (pin?: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  lock: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const [hasPinSet, bioEnabled] = await Promise.all([
        isPinSet(),
        isBiometricEnabled(),
      ]);
      setPinSet(hasPinSet);
      setBiometricEnabled(bioEnabled);

      if (Platform.OS !== "web") {
        try {
          const LocalAuth = await import("expo-local-authentication");
          const hasHardware = await LocalAuth.hasHardwareAsync();
          const isEnrolled = await LocalAuth.isEnrolledAsync();
          setBiometricAvailable(hasHardware && isEnrolled);
        } catch {
          setBiometricAvailable(false);
        }
      }

      if (!hasPinSet) {
        setIsAuthenticated(true);
      }
    })();
  }, []);

  const authenticate = useCallback(async (pin?: string): Promise<boolean> => {
    if (!pinSet) {
      setIsAuthenticated(true);
      return true;
    }

    if (pin !== undefined) {
      const valid = await verifyPin(pin);
      if (valid) setIsAuthenticated(true);
      return valid;
    }

    if (biometricEnabled && biometricAvailable && Platform.OS !== "web") {
      try {
        const LocalAuth = await import("expo-local-authentication");
        const result = await LocalAuth.authenticateAsync({
          promptMessage: "المصادقة للدخول إلى PureWallet",
          fallbackLabel: "استخدام الرمز السري",
          cancelLabel: "إلغاء",
        });
        if (result.success) {
          setIsAuthenticated(true);
          return true;
        }
      } catch {
        // Fallback to PIN
      }
    }

    return false;
  }, [pinSet, biometricEnabled, biometricAvailable]);

  const setupPin = useCallback(async (pin: string) => {
    await storePin(pin);
    setPinSet(true);
  }, []);

  const handleRemovePin = useCallback(async () => {
    await removePin();
    setPinSet(false);
    setIsAuthenticated(true);
  }, []);

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    await storeBiometricEnabled(enabled);
    setBiometricEnabled(enabled);
  }, []);

  const lock = useCallback(() => {
    if (pinSet) setIsAuthenticated(false);
  }, [pinSet]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        pinSet,
        biometricEnabled,
        biometricAvailable,
        authenticate,
        setupPin,
        removePin: handleRemovePin,
        toggleBiometric,
        lock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
