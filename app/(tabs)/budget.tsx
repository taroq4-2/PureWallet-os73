import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBudget } from "@/context/BudgetContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, Category, getCategoryById } from "@/utils/categories";

const SPENDING_CATS = CATEGORIES.filter((c) => c.id !== "uncategorized");

function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const clamped = Math.min(ratio, 1);
  const barColor = ratio >= 1 ? "#F43F5E" : ratio >= 0.75 ? "#F59E0B" : color;
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${Math.round(clamped * 100)}%`, backgroundColor: barColor }]} />
    </View>
  );
}

export default function BudgetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    budgetLimits,
    setBudgetLimit,
    clearBudgetLimit,
    applyAutoSuggest,
    autoSuggestLimits,
    totalBudget,
    totalSpentThisMonth,
    categorySpending,
  } = useBudget();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestedLimits, setSuggestedLimits] = useState<Record<string, number>>({});

  const remaining = totalBudget - totalSpentThisMonth;
  const overallRatio = totalBudget > 0 ? totalSpentThisMonth / totalBudget : 0;
  const overallColor =
    overallRatio >= 1 ? "#F43F5E" : overallRatio >= 0.75 ? "#F59E0B" : "#10B981";

  const activeCategories = useMemo(() => {
    const withBudget = SPENDING_CATS.filter((c) => budgetLimits[c.id]);
    const withSpending = SPENDING_CATS.filter(
      (c) => !budgetLimits[c.id] && categorySpending[c.id],
    );
    const rest = SPENDING_CATS.filter(
      (c) => !budgetLimits[c.id] && !categorySpending[c.id],
    );
    return [...withBudget, ...withSpending, ...rest];
  }, [budgetLimits, categorySpending]);

  const handleEdit = (cat: Category) => {
    setEditCat(cat);
    setEditAmount(budgetLimits[cat.id] ? String(budgetLimits[cat.id]) : "");
  };

  const handleSave = async () => {
    if (!editCat) return;
    const val = parseFloat(editAmount.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) {
      Alert.alert("خطأ", "أدخل مبلغاً صحيحاً أكبر من صفر");
      return;
    }
    await setBudgetLimit(editCat.id, val);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditCat(null);
    setEditAmount("");
  };

  const handleRemove = async () => {
    if (!editCat) return;
    await clearBudgetLimit(editCat.id);
    setEditCat(null);
    setEditAmount("");
  };

  const handleShowSuggest = () => {
    const suggested = autoSuggestLimits();
    if (Object.keys(suggested).length === 0) {
      Alert.alert(
        "لا توجد بيانات",
        "يحتاج التطبيق لعمليات مستوردة من رسائل SMS من الأشهر الثلاثة الماضية لاقتراح ميزانية.",
      );
      return;
    }
    setSuggestedLimits(suggested);
    setShowSuggest(true);
  };

  const handleApplySuggest = async () => {
    await applyAutoSuggest();
    setShowSuggest(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الميزانية الشهرية</Text>
        <TouchableOpacity
          style={[styles.suggestBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary }]}
          onPress={handleShowSuggest}
        >
          <Feather name="zap" size={14} color={colors.primary} />
          <Text style={[styles.suggestBtnText, { color: colors.primary }]}>اقتراح تلقائي</Text>
        </TouchableOpacity>
      </View>

      {totalBudget > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>الميزانية الإجمالية</Text>
          <Text style={[styles.summaryAmount, { color: colors.foreground }]}>
            {totalSpentThisMonth.toFixed(0)}
            <Text style={[styles.summaryOf, { color: colors.mutedForeground }]}>
              {" / "}{totalBudget.toFixed(0)} ر.س
            </Text>
          </Text>
          <ProgressBar ratio={overallRatio} color={overallColor} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.mutedForeground }]}>مُنفق</Text>
              <Text style={[styles.summaryItemVal, { color: colors.negative }]}>
                {totalSpentThisMonth.toFixed(2)} ر.س
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.mutedForeground }]}>متبقي</Text>
              <Text style={[styles.summaryItemVal, { color: remaining >= 0 ? colors.positive : colors.negative }]}>
                {Math.abs(remaining).toFixed(2)} ر.س
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.mutedForeground }]}>النسبة</Text>
              <Text style={[styles.summaryItemVal, { color: overallColor }]}>
                {Math.round(overallRatio * 100)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {totalBudget === 0 && (
        <View style={[styles.emptyHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            اضغط على فئة لتحديد ميزانيتها، أو استخدم "اقتراح تلقائي" إذا كانت لديك عمليات مستوردة من SMS.
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>الفئات</Text>

      {activeCategories.map((cat) => {
        const limit = budgetLimits[cat.id] ?? 0;
        const spent = categorySpending[cat.id] ?? 0;
        const ratio = limit > 0 ? spent / limit : 0;
        const statusColor =
          limit === 0
            ? colors.mutedForeground
            : ratio >= 1
            ? "#F43F5E"
            : ratio >= 0.75
            ? "#F59E0B"
            : "#10B981";

        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleEdit(cat)}
            activeOpacity={0.75}
          >
            <View style={[styles.catIcon, { backgroundColor: cat.color + "22" }]}>
              <Feather name={cat.icon as any} size={17} color={cat.color} />
            </View>
            <View style={styles.catInfo}>
              <View style={styles.catTop}>
                <Text style={[styles.catName, { color: colors.foreground }]}>{cat.nameAr}</Text>
                {limit > 0 ? (
                  <Text style={[styles.catAmounts, { color: statusColor }]}>
                    {spent.toFixed(0)} / {limit.toFixed(0)} ر.س
                  </Text>
                ) : spent > 0 ? (
                  <Text style={[styles.catAmounts, { color: colors.mutedForeground }]}>
                    {spent.toFixed(0)} ر.س (بلا حد)
                  </Text>
                ) : (
                  <Text style={[styles.catNoLimit, { color: colors.mutedForeground }]}>
                    اضغط لتحديد حد
                  </Text>
                )}
              </View>
              {limit > 0 && <ProgressBar ratio={ratio} color={cat.color} />}
              {limit > 0 && ratio >= 0.75 && (
                <Text style={[styles.warningText, { color: statusColor }]}>
                  {ratio >= 1
                    ? `تجاوزت الميزانية بـ ${(spent - limit).toFixed(0)} ر.س`
                    : `${Math.round((1 - ratio) * 100)}% متبقي (${(limit - spent).toFixed(0)} ر.س)`}
                </Text>
              )}
            </View>
            <Feather name="edit-2" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        );
      })}

      {/* Edit Budget Modal */}
      <Modal visible={!!editCat} transparent animationType="slide" onRequestClose={() => setEditCat(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setEditCat(null)} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />

          {editCat && (
            <>
              <View style={styles.sheetHeader}>
                <View style={[styles.sheetIcon, { backgroundColor: editCat.color + "22" }]}>
                  <Feather name={editCat.icon as any} size={20} color={editCat.color} />
                </View>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{editCat.nameAr}</Text>
                  <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>
                    {categorySpending[editCat.id]
                      ? `مُنفق هذا الشهر: ${(categorySpending[editCat.id] ?? 0).toFixed(2)} ر.س`
                      : "لا توجد عمليات هذا الشهر"}
                  </Text>
                </View>
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground }]}>الحد الشهري (ريال)</Text>
              <TextInput
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="مثال: 500"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                autoFocus
              />

              <View style={styles.sheetBtns}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Feather name="check" size={17} color="#fff" />
                  <Text style={styles.saveBtnText}>حفظ الميزانية</Text>
                </TouchableOpacity>
                {budgetLimits[editCat.id] && (
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: "#F43F5E18", borderColor: "#F43F5E" }]}
                    onPress={handleRemove}
                  >
                    <Feather name="trash-2" size={17} color="#F43F5E" />
                    <Text style={styles.removeBtnText}>حذف الحد</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Auto-Suggest Preview Modal */}
      <Modal visible={showSuggest} transparent animationType="slide" onRequestClose={() => setShowSuggest(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSuggest(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground, marginBottom: 4 }]}>اقتراح ميزانية تلقائي</Text>
          <Text style={[styles.sheetSub, { color: colors.mutedForeground, marginBottom: 16 }]}>
            بناءً على متوسط إنفاقك في الأشهر الثلاثة الماضية
          </Text>

          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {Object.entries(suggestedLimits).map(([catId, amount]) => {
              const cat = getCategoryById(catId);
              return (
                <View key={catId} style={[styles.suggestRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.catIcon, { backgroundColor: cat.color + "22" }]}>
                    <Feather name={cat.icon as any} size={15} color={cat.color} />
                  </View>
                  <Text style={[styles.suggestCat, { color: colors.foreground }]}>{cat.nameAr}</Text>
                  <Text style={[styles.suggestAmt, { color: colors.primary }]}>{amount} ر.س</Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
            onPress={handleApplySuggest}
          >
            <Feather name="zap" size={17} color="#fff" />
            <Text style={styles.saveBtnText}>تطبيق الاقتراح</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  suggestBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  suggestBtnText: { fontSize: 13, fontWeight: "600" },
  summaryCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 10 },
  summaryLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  summaryAmount: { fontSize: 26, fontWeight: "800" },
  summaryOf: { fontSize: 16, fontWeight: "400" },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 4 },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryItemLabel: { fontSize: 11, marginBottom: 3 },
  summaryItemVal: { fontSize: 15, fontWeight: "700" },
  divider: { width: 1, height: 32 },
  emptyHint: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 12 },
  emptyText: { flex: 1, fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8 },
  catRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  catIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  catInfo: { flex: 1, gap: 6 },
  catTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catName: { fontSize: 14, fontWeight: "600" },
  catAmounts: { fontSize: 13, fontWeight: "600" },
  catNoLimit: { fontSize: 12 },
  warningText: { fontSize: 11, fontWeight: "500" },
  barBg: { height: 6, borderRadius: 3, backgroundColor: "#1E2A3A", overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18, opacity: 0.4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  sheetIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  sheetSub: { fontSize: 13, marginTop: 2 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  sheetBtns: { gap: 10 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  removeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12, borderWidth: 1 },
  removeBtnText: { color: "#F43F5E", fontSize: 15, fontWeight: "600" },
  suggestRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  suggestCat: { flex: 1, fontSize: 14, fontWeight: "500" },
  suggestAmt: { fontSize: 15, fontWeight: "700" },
});