import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DonutChart, DonutSegment } from "@/components/DonutChart";
import { EmptyState } from "@/components/EmptyState";
import { TransactionCard } from "@/components/TransactionCard";
import { useTransactions } from "@/context/TransactionsContext";
import { useColors } from "@/hooks/useColors";
import { getCategoryById } from "@/utils/categories";

const MONTH_NAMES_AR = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, monthStats, loading } = useTransactions();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const month  = MONTH_NAMES_AR[new Date().getMonth()];

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
    [transactions],
  );

  const segments = useMemo<DonutSegment[]>(() => {
    if (monthStats.byCategory.length === 0) return [];
    const top = monthStats.byCategory.slice(0, 6);
    return top.map((bc) => {
      const cat = getCategoryById(bc.categoryId);
      return { value: bc.amount, color: cat.color, label: cat.nameAr };
    });
  }, [monthStats]);

  const changeAbsolute = monthStats.total - monthStats.previousTotal;
  const isIncrease     = changeAbsolute >= 0;

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>مرحباً بك في</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>PureWallet</Text>
        </View>
        <View style={[styles.monthBadge, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text style={[styles.monthText, { color: colors.primary }]}>{month}</Text>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>إجمالي الشهر</Text>
            <Text style={[styles.summaryAmount, { color: colors.foreground }]}>
              {monthStats.total.toFixed(2)}
              <Text style={[styles.currencyLabel, { color: colors.mutedForeground }]}> ر.س</Text>
            </Text>
            {monthStats.previousTotal > 0 && (
              <View style={styles.changeRow}>
                <Feather
                  name={isIncrease ? "trending-up" : "trending-down"}
                  size={13}
                  color={isIncrease ? (colors as any).negative : (colors as any).positive}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: isIncrease ? (colors as any).negative : (colors as any).positive },
                  ]}
                >
                  {Math.abs(monthStats.changePercent).toFixed(1)}% عن الشهر الماضي
                </Text>
              </View>
            )}
          </View>

          {segments.length > 0 ? (
            <DonutChart
              segments={segments}
              size={140}
              strokeWidth={20}
              centerValue={`${segments.length}`}
              centerLabel="فئات"
            />
          ) : (
            <View style={styles.emptyChart}>
              <Feather name="pie-chart" size={40} color={colors.border} />
            </View>
          )}
        </View>

        {segments.length > 0 && (
          <View style={styles.legend}>
            {segments.map((seg, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                <Text style={[styles.legendLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {seg.label}
                </Text>
                <Text style={[styles.legendAmount, { color: colors.foreground }]}>
                  {seg.value.toFixed(0)} ر.س
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {monthStats.byCategory.length > 0 && (
        <View style={[styles.barsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>توزيع المصروفات</Text>
          {monthStats.byCategory.slice(0, 5).map((bc) => {
            const cat  = getCategoryById(bc.categoryId);
            const pct  = monthStats.total > 0 ? (bc.amount / monthStats.total) * 100 : 0;
            return (
              <View key={bc.categoryId} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{cat.nameAr}</Text>
                <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(pct, 3)}%` as any, backgroundColor: cat.color },
                    ]}
                  />
                </View>
                <Text style={[styles.barPct, { color: colors.foreground }]}>{pct.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      )}

      <Text style={[styles.recentTitle, { color: colors.foreground }]}>آخر العمليات</Text>

      <View style={styles.recentList}>
        {recent.length === 0 ? (
          <EmptyState icon="activity" title="لا توجد عمليات بعد" subtitle="أضف عملية يدوياً من الإعدادات" />
        ) : (
          recent.map((t) => (
            <TransactionCard key={t.id} transaction={t} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1 },
  center:        { alignItems: "center", justifyContent: "center" },
  loadingText:   { fontSize: 16 },
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 16 },
  greeting:      { fontSize: 13, marginBottom: 2 },
  appName:       { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  monthBadge:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  monthText:     { fontSize: 13, fontWeight: "600" },
  summaryCard:   { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 12 },
  summaryTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLeft:   { flex: 1, gap: 6 },
  summaryLabel:  { fontSize: 13 },
  summaryAmount: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  currencyLabel: { fontSize: 16, fontWeight: "400", letterSpacing: 0 },
  changeRow:     { flexDirection: "row", alignItems: "center", gap: 5 },
  changeText:    { fontSize: 12, fontWeight: "500" },
  emptyChart:    { width: 140, height: 140, alignItems: "center", justifyContent: "center" },
  legend:        { marginTop: 16, gap: 8 },
  legendItem:    { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot:     { width: 8, height: 8, borderRadius: 4 },
  legendLabel:   { flex: 1, fontSize: 13 },
  legendAmount:  { fontSize: 13, fontWeight: "600" },
  barsCard:      { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 12, gap: 12 },
  sectionLabel:  { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  barRow:        { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel:      { width: 70, fontSize: 12, textAlign: "right" },
  barTrack:      { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  barFill:       { height: "100%", borderRadius: 4 },
  barPct:        { width: 36, fontSize: 12, fontWeight: "600", textAlign: "right" },
  recentTitle:   { fontSize: 18, fontWeight: "700", paddingHorizontal: 20, marginBottom: 10, marginTop: 4 },
  recentList:    { paddingHorizontal: 16 },
});
