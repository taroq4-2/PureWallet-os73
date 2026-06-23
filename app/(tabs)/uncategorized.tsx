import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategorySelector } from "@/components/CategorySelector";
import { EmptyState } from "@/components/EmptyState";
import { TransactionCard } from "@/components/TransactionCard";
import { useTransactions } from "@/context/TransactionsContext";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/utils/categories";
import { StoredTransaction } from "@/utils/storage";

export default function UncategorizedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, categorize } = useTransactions();

  const [selected, setSelected] = useState<StoredTransaction | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const uncategorized = transactions.filter((t) => t.categoryId === "uncategorized");

  const handleCategorize = (tx: StoredTransaction) => {
    setSelected(tx);
    setShowSelector(true);
  };

  const handleSelect = async (cat: Category) => {
    if (!selected) return;
    await categorize(selected.id, cat.id);
    setSelected(null);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>غير المصنف</Text>
        {uncategorized.length > 0 && (
          <View style={[styles.badge, { backgroundColor: "#F43F5E" }]}>
            <Text style={styles.badgeText}>{uncategorized.length}</Text>
          </View>
        )}
      </View>

      {uncategorized.length > 0 && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          اضغط "صنّف" لتصنيف كل عملية
        </Text>
      )}

      <FlatList
        data={uncategorized}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 },
        ]}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            showCategoryAction
            onCategorize={() => handleCategorize(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="check-circle"
            title="ممتاز! لا توجد عمليات غير مصنفة"
            subtitle="ستظهر العمليات الجديدة من البنوك هنا تلقائياً"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CategorySelector
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleSelect}
        selectedId={selected?.categoryId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});
