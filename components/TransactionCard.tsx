import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { getCategoryById } from "@/utils/categories";
import { StoredTransaction } from "@/utils/storage";

interface Props {
  transaction: StoredTransaction;
  onPress?: () => void;
  onDelete?: () => void;
  showCategoryAction?: boolean;
  onCategorize?: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - ts) / 86_400_000);
  if (diff === 0) return "اليوم";
  if (diff === 1) return "أمس";
  if (diff < 7) return `منذ ${diff} أيام`;
  return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

function maskAmount(amount: number): string {
  return amount.toFixed(2);
}

export function TransactionCard({
  transaction,
  onPress,
  onDelete,
  showCategoryAction,
  onCategorize,
}: Props) {
  const colors = useColors();
  const category = getCategoryById(transaction.categoryId);

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: category.color + "22" }]}>
        <Feather name={category.icon as any} size={18} color={category.color} />
      </View>

      <View style={styles.middle}>
        <Text style={[styles.merchant, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.merchantName}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.bank, { color: colors.mutedForeground }]}>{transaction.bankName}</Text>
          <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDate(transaction.timestamp)}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.negative }]}>
          {maskAmount(transaction.amount)} ر.س
        </Text>
        {showCategoryAction ? (
          <TouchableOpacity
            style={[styles.classifyBtn, { backgroundColor: colors.primary + "22" }]}
            onPress={onCategorize}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.classifyText, { color: colors.primary }]}>صنّف</Text>
          </TouchableOpacity>
        ) : (
          onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 0 }}
            >
              <Feather name="trash-2" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: { flex: 1, gap: 4 },
  merchant: { fontSize: 15, fontWeight: "600" },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  bank: { fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  date: { fontSize: 12 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 15, fontWeight: "700" },
  classifyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  classifyText: { fontSize: 12, fontWeight: "600" },
});
