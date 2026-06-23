import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategorySelector } from "@/components/CategorySelector";
import { EmptyState } from "@/components/EmptyState";
import { TransactionCard } from "@/components/TransactionCard";
import { useTransactions } from "@/context/TransactionsContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, Category, getCategoryById } from "@/utils/categories";
import { StoredTransaction } from "@/utils/storage";

const PAGE_SIZE = 20;

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, categorize, deleteTransaction } = useTransactions();

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [editTarget, setEditTarget] = useState<StoredTransaction | null>(null);
  const [showCatSel, setShowCatSel] = useState(false);
  const [page, setPage] = useState(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = useMemo(() => {
    let list = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchantName.toLowerCase().includes(q) ||
          t.bankName.toLowerCase().includes(q) ||
          t.normalizedMerchant.includes(q),
      );
    }
    if (filterCat !== "all") {
      list = list.filter((t) => t.categoryId === filterCat);
    }
    return list;
  }, [transactions, query, filterCat]);

  const displayed = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  const totalFiltered = useMemo(
    () => filtered.reduce((s, t) => s + t.amount, 0),
    [filtered],
  );

  const handleEdit = useCallback((tx: StoredTransaction) => {
    setEditTarget(tx);
    setShowCatSel(true);
  }, []);

  const handleSelect = useCallback(
    async (cat: Category) => {
      if (!editTarget) return;
      await categorize(editTarget.id, cat.id);
      setEditTarget(null);
    },
    [editTarget, categorize],
  );

  const handleLoadMore = useCallback(() => {
    if (displayed.length < filtered.length) {
      setPage((p) => p + 1);
    }
  }, [displayed.length, filtered.length]);

  const handleFilterChange = useCallback((id: string) => {
    setFilterCat(id);
    setPage(1);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>العمليات</Text>
        <Text style={[styles.totalChip, { color: colors.primary, backgroundColor: colors.primary + "18" }]}>
          {totalFiltered.toFixed(0)} ر.س
        </Text>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={(t) => { setQuery(t); setPage(1); }}
          placeholder="ابحث عن متجر أو بنك..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {[{ id: "all", nameAr: "الكل" }, ...CATEGORIES].map((c) => {
          const active = filterCat === c.id;
          const cat = c.id !== "all" ? getCategoryById(c.id) : null;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? (cat?.color ?? colors.primary) : colors.card,
                  borderColor: active ? (cat?.color ?? colors.primary) : colors.border,
                },
              ]}
              onPress={() => handleFilterChange(c.id)}
            >
              <Text style={[styles.chipText, { color: active ? "#fff" : colors.mutedForeground }]}>
                {c.nameAr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={displayed}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 },
        ]}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() => handleEdit(item)}
            onDelete={() => deleteTransaction(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title="لا توجد عمليات"
            subtitle={query ? "جرب كلمة بحث مختلفة" : "ستظهر عملياتك هنا"}
          />
        }
        ListFooterComponent={
          displayed.length < filtered.length ? (
            <TouchableOpacity
              style={[styles.loadMoreBtn, { borderColor: colors.border }]}
              onPress={handleLoadMore}
            >
              <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                تحميل المزيد ({filtered.length - displayed.length})
              </Text>
            </TouchableOpacity>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!displayed.length}
      />

      <CategorySelector
        visible={showCatSel}
        onClose={() => setShowCatSel(false)}
        onSelect={handleSelect}
        selectedId={editTarget?.categoryId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, flex: 1 },
  totalChip: { fontSize: 14, fontWeight: "700", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, textAlign: "right" },
  filters: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  loadMoreBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  loadMoreText: { fontSize: 14, fontWeight: "600" },
});
