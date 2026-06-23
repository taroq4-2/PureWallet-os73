import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  onComplete: (pin: string) => void;
  title?: string;
  subtitle?: string;
  error?: string;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export function PinPad({ onComplete, title, subtitle, error }: Props) {
  const colors = useColors();
  const [pin, setPin] = useState("");

  const handleDigit = (digit: string) => {
    if (digit === "back") {
      setPin((p) => p.slice(0, -1));
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (!digit) return;

    const next = pin + digit;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (next.length === 4) {
      setPin("");
      onComplete(next);
    } else {
      setPin(next);
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: pin.length > i ? colors.primary : colors.muted,
                borderColor: pin.length > i ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.negative }]}>{error}</Text>
      ) : (
        <View style={styles.errorPlaceholder} />
      )}

      <View style={styles.grid}>
        {DIGITS.map((digit, i) => {
          if (!digit && i === 9) return <View key={i} style={styles.emptyKey} />;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.key,
                {
                  backgroundColor: digit === "" ? "transparent" : colors.card,
                  borderColor: digit === "" ? "transparent" : colors.border,
                },
              ]}
              onPress={() => handleDigit(digit)}
              activeOpacity={0.7}
              disabled={!digit && digit !== "0" && digit !== "back"}
            >
              {digit === "back" ? (
                <Feather name="delete" size={22} color={colors.foreground} />
              ) : (
                <Text style={[styles.keyText, { color: colors.foreground }]}>{digit}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8, paddingHorizontal: 32 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  dots: { flexDirection: "row", gap: 16, marginVertical: 20 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  error: { fontSize: 13, minHeight: 18, marginBottom: 4 },
  errorPlaceholder: { height: 18, marginBottom: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 270,
    gap: 14,
    justifyContent: "center",
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emptyKey: { width: 76, height: 76 },
  keyText: { fontSize: 26, fontWeight: "400" },
});
