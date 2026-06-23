import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinPad } from "@/components/PinPad";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/images/icon.png");

export function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { authenticate, biometricEnabled, biometricAvailable } = useAuth();
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (biometricEnabled && biometricAvailable) {
      handleBiometric();
    }
  }, [biometricEnabled, biometricAvailable]);

  const handleBiometric = async () => {
    setError("");
    const ok = await authenticate();
    if (!ok && biometricEnabled) {
      setError("فشلت المصادقة، أدخل الرمز السري");
    }
  };

  const handlePin = async (pin: string) => {
    setError("");
    const ok = await authenticate(pin);
    if (!ok) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setError("محاولات كثيرة، انتظر قليلاً");
        setTimeout(() => setAttempts(0), 30_000);
      } else {
        setError(`رمز سري خاطئ (${next}/5)`);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad + 20 },
      ]}
    >
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} resizeMode="cover" />
        <Text style={[styles.appName, { color: colors.foreground }]}>PureWallet</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          أدخل الرمز السري للمتابعة
        </Text>
      </View>

      <PinPad
        onComplete={handlePin}
        error={error}
        title=""
        subtitle=""
      />

      {biometricEnabled && biometricAvailable && (
        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
          <Feather name="cpu" size={24} color={colors.primary} />
          <Text style={[styles.biometricText, { color: colors.primary }]}>
            استخدام بصمة الوجه أو الإصبع
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  header: { alignItems: "center", gap: 8, marginBottom: 10 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 4 },
  appName: { fontSize: 26, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 14 },
  biometricBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  biometricText: { fontSize: 14, fontWeight: "500" },
});
