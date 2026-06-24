import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategorySelector } from "@/components/CategorySelector";
import { PinPad } from "@/components/PinPad";
import { useAuth } from "@/context/AuthContext";
import { useSms } from "@/context/SmsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { useColors } from "@/hooks/useColors";
import { BANK_REGEX_TEMPLATES } from "@/utils/bankTemplates";
import { CATEGORIES, Category, getCategoryById } from "@/utils/categories";
import { TransactionInputSchema, normalizeMerchantName } from "@/utils/validation";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTransaction, clearAllData, transactions } = useTransactions();
  const { pinSet, biometricEnabled, biometricAvailable, setupPin, removePin, toggleBiometric, lock } = useAuth();
  const { permission, scanning, lastScan, totalImported, requestPermission, scan, scanHistorical } = useSms();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCatSel, setShowCatSel] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [smsResult, setSmsResult] = useState<string | null>(null);

  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("بنك الراجحي");
  const [selCategory, setSelCategory] = useState<Category>(getCategoryById("other"));
  const [addError, setAddError] = useState("");

  const banks = [
    "بنك الراجحي",
    "البنك الأهلي السعودي",
    "بنك الرياض",
    "بنك ساب",
    "بنك البلاد",
    "بنك الجزيرة",
    "بنك النماء",
    "أخرى",
  ];

  const handleAdd = async () => {
    setAddError("");
    const parsed = parseFloat(amount.replace(/,/g, ""));

    const result = TransactionInputSchema.safeParse({
      bankName: bank,
      amount: parsed,
      merchantName: merchant.trim(),
      timestamp: Date.now(),
      categoryId: selCategory.id,
      isManual: true,
    });

    if (!result.success) {
      setAddError(result.error.issues[0]?.message ?? "خطأ في البيانات");
      return;
    }

    await addTransaction(result.data);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowAddModal(false);
    setMerchant("");
    setAmount("");
    setAddError("");
  };

  const handleClear = () => {
    Alert.alert(
      "حذف جميع البيانات",
      "هل أنت متأكد؟ سيتم حذف جميع العمليات بشكل نهائي.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          },
        },
      ],
    );
  };

  const handlePinSetup = (pin: string) => {
    if (pinStep === "enter") {
      setFirstPin(pin);
      setPinStep("confirm");
      setPinError("");
    } else {
      if (pin === firstPin) {
        setupPin(pin).then(() => {
          setShowPinSetup(false);
          setPinStep("enter");
          setFirstPin("");
          setPinError("");
        });
      } else {
        setPinError("الرمزان غير متطابقين، حاول مرة أخرى");
        setPinStep("enter");
        setFirstPin("");
      }
    }
  };

  const handleRemovePin = () => {
    Alert.alert("إزالة الرمز السري", "هل تريد إزالة حماية الرمز السري؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "إزالة", style: "destructive", onPress: () => removePin() },
    ]);
  };

  const handleRequestSms = async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert(
        "الصلاحية مرفوضة",
        permission === "blocked"
          ? "يرجى الذهاب إلى إعدادات الجهاز ومنح صلاحية قراءة الرسائل يدوياً."
          : "يحتاج التطبيق لهذه الصلاحية لقراءة رسائل البنك.",
      );
    }
  };

  const handleScanNow = async () => {
    setSmsResult(null);
    const added = await scan();
    setSmsResult(added > 0 ? `تم استيراد ${added} عملية جديدة ✓` : "لا توجد رسائل بنكية جديدة");
    if (Platform.OS !== "web" && added > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleScanHistorical = async () => {
    setSmsResult(null);
    const added = await scanHistorical();
    setSmsResult(
      added > 0 ? `تم استيراد ${added} عملية من آخر 90 يوم ✓` : "لا توجد رسائل بنكية في آخر 90 يوم",
    );
    if (Platform.OS !== "web" && added > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const smsPermissionLabel =
    permission === "granted"
      ? "مفعّل ✓"
      : permission === "blocked"
      ? "محجوب (الإعدادات)"
      : permission === "denied"
      ? "مرفوض"
      : "غير مفعّل";

  const smsPermissionColor =
    permission === "granted" ? "#10B981" : permission === "blocked" ? "#F43F5E" : colors.mutedForeground;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الإعدادات</Text>
      </View>

      <SectionTitle title="العمليات" colors={colors} />

      <SettingRow
        colors={colors}
        icon="plus-circle"
        iconColor={colors.primary}
        label="إضافة عملية يدوياً"
        onPress={() => setShowAddModal(true)}
      />

      {Platform.OS === "android" && (
        <>
          <SectionTitle title="رسائل SMS" colors={colors} />

          <View style={[styles.smsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.smsHeader}>
              <View style={[styles.smsIcon, { backgroundColor: "#3B82F622" }]}>
                <Feather name="message-square" size={16} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smsTitle, { color: colors.foreground }]}>استيراد رسائل البنك</Text>
                <Text style={[styles.smsSubtitle, { color: smsPermissionColor }]}>{smsPermissionLabel}</Text>
              </View>
              {totalImported > 0 && (
                <View style={[styles.countBadge, { backgroundColor: "#3B82F622" }]}>
                  <Text style={[styles.countText, { color: "#3B82F6" }]}>{totalImported} مستورد</Text>
                </View>
              )}
            </View>

            <Text style={[styles.smsDesc, { color: colors.mutedForeground }]}>
              يقرأ التطبيق رسائل البنوك المحلية ويستورد العمليات تلقائياً. لا تُرفع أي بيانات للإنترنت.
            </Text>

            {lastScan > 0 && (
              <Text style={[styles.lastScanText, { color: colors.mutedForeground }]}>
                آخر مسح: {new Date(lastScan).toLocaleTimeString("ar-SA")}
              </Text>
            )}

            {smsResult && (
              <View style={[styles.resultBanner, { backgroundColor: smsResult.includes("✓") ? "#10B98122" : colors.muted }]}>
                <Text style={[styles.resultText, { color: smsResult.includes("✓") ? "#10B981" : colors.mutedForeground }]}>
                  {smsResult}
                </Text>
              </View>
            )}

            <View style={styles.smsBtns}>
              {permission !== "granted" ? (
                <TouchableOpacity
                  style={[styles.smsBtn, { backgroundColor: "#3B82F6" }]}
                  onPress={handleRequestSms}
                >
                  <Feather name="shield" size={15} color="#fff" />
                  <Text style={styles.smsBtnText}>منح الصلاحية</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.smsBtn, { backgroundColor: colors.primary, opacity: scanning ? 0.6 : 1 }]}
                    onPress={handleScanNow}
                    disabled={scanning}
                  >
                    <Feather name="refresh-cw" size={15} color="#fff" />
                    <Text style={styles.smsBtnText}>{scanning ? "جاري المسح..." : "مسح الجديد"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smsBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border, opacity: scanning ? 0.6 : 1 }]}
                    onPress={handleScanHistorical}
                    disabled={scanning}
                  >
                    <Feather name="clock" size={15} color={colors.foreground} />
                    <Text style={[styles.smsBtnText, { color: colors.foreground }]}>استيراد 90 يوم</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.smsBanks}>
              <Text style={[styles.smsBanksLabel, { color: colors.mutedForeground }]}>البنوك المدعومة: </Text>
              <Text style={[styles.smsBanksLabel, { color: colors.primary }]}>
                الراجحي (AlRajhiBank) • الأهلي (SNB-AIAhli) • الرياض • العربي الوطني
              </Text>
            </View>
          </View>
        </>
      )}

      <SectionTitle title="الأمان والخصوصية" colors={colors} />

      <View style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.secRow}>
          <View style={[styles.secIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="lock" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.secLabel, { color: colors.foreground }]}>الرمز السري</Text>
          <TouchableOpacity
            style={[
              styles.secToggle,
              { backgroundColor: pinSet ? colors.negative + "22" : colors.positive + "22" },
            ]}
            onPress={pinSet ? handleRemovePin : () => setShowPinSetup(true)}
          >
            <Text style={{ color: pinSet ? colors.negative : colors.positive, fontSize: 13, fontWeight: "600" }}>
              {pinSet ? "إزالة" : "تفعيل"}
            </Text>
          </TouchableOpacity>
        </View>

        {pinSet && biometricAvailable && Platform.OS !== "web" && (
          <View style={[styles.secRow, { marginTop: 12 }]}>
            <View style={[styles.secIcon, { backgroundColor: colors.accent + "22" }]}>
              <Feather name="cpu" size={16} color={colors.accent} />
            </View>
            <Text style={[styles.secLabel, { color: colors.foreground }]}>المصادقة البيومترية</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={biometricEnabled ? "#fff" : colors.mutedForeground}
            />
          </View>
        )}

        {pinSet && (
          <TouchableOpacity style={styles.lockNowBtn} onPress={lock}>
            <Feather name="shield" size={14} color={colors.mutedForeground} />
            <Text style={[styles.lockNowText, { color: colors.mutedForeground }]}>قفل التطبيق الآن</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          "البيانات مشفرة ومحفوظة محلياً على جهازك",
          "لا يتم إرسال أي بيانات للإنترنت",
          "رسائل OTP يتم تجاهلها تلقائياً",
          "الرمز السري مخزن بشكل آمن",
        ].map((l, i) => (
          <View key={i} style={styles.infoRow}>
            <Feather name="shield" size={13} color="#10B981" />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{l}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="قوالب البنوك (محرك التحليل)" colors={colors} />

      {BANK_REGEX_TEMPLATES.map((b) => (
        <View key={b.bankName} style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.templateHeader}>
            <Feather name="database" size={15} color={colors.primary} />
            <Text style={[styles.templateBank, { color: colors.foreground }]}>{b.bankName}</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{b.patternCount} قالب</Text>
            </View>
          </View>
          <Text style={[styles.templateDesc, { color: colors.mutedForeground }]}>{b.description}</Text>
        </View>
      ))}

      <SectionTitle title="البيانات" colors={colors} />

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <StatItem colors={colors} label="إجمالي العمليات" value={transactions.length.toString()} />
        <StatItem colors={colors} label="الفئات المدعومة" value={CATEGORIES.length.toString()} />
        <StatItem colors={colors} label="البنوك المدعومة" value={BANK_REGEX_TEMPLATES.length.toString()} />
      </View>

      <SectionTitle title="الخطر" colors={colors} />

      <TouchableOpacity
        style={[styles.dangerBtn, { backgroundColor: "#F43F5E18", borderColor: "#F43F5E" }]}
        onPress={handleClear}
      >
        <Feather name="trash-2" size={18} color="#F43F5E" />
        <Text style={styles.dangerText}>حذف جميع البيانات</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAddModal(false)} />
        <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>إضافة عملية يدوياً</Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>اسم المتجر</Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder="مثال: كارفور"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>المبلغ (ريال)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>البنك</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 2 }}>
              {banks.map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setBank(b)}
                  style={[
                    styles.bankChip,
                    { backgroundColor: bank === b ? colors.primary : colors.muted, borderColor: bank === b ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={{ color: bank === b ? "#fff" : colors.mutedForeground, fontSize: 13 }}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>الفئة</Text>
          <TouchableOpacity
            style={[styles.catBtn, { backgroundColor: selCategory.color + "22", borderColor: selCategory.color }]}
            onPress={() => setShowCatSel(true)}
          >
            <Feather name={selCategory.icon as any} size={18} color={selCategory.color} />
            <Text style={[styles.catBtnText, { color: selCategory.color }]}>{selCategory.nameAr}</Text>
            <Feather name="chevron-down" size={16} color={selCategory.color} />
          </TouchableOpacity>

          {addError ? (
            <Text style={[styles.errorText, { color: colors.negative }]}>{addError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
          >
            <Text style={styles.addBtnText}>إضافة العملية</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showPinSetup} transparent animationType="slide" onRequestClose={() => setShowPinSetup(false)}>
        <View style={[styles.pinModal, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.pinClose} onPress={() => { setShowPinSetup(false); setPinStep("enter"); setFirstPin(""); setPinError(""); }}>
            <Feather name="x" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
          <PinPad
            onComplete={handlePinSetup}
            title={pinStep === "enter" ? "أدخل الرمز السري الجديد" : "أكد الرمز السري"}
            subtitle={pinStep === "enter" ? "4 أرقام سيتم استخدامها لقفل التطبيق" : "أدخل الرمز مرة أخرى للتأكيد"}
            error={pinError}
          />
        </View>
      </Modal>

      <CategorySelector
        visible={showCatSel}
        onClose={() => setShowCatSel(false)}
        onSelect={(cat) => setSelCategory(cat)}
        selectedId={selCategory.id}
      />
    </ScrollView>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
  );
}

function SettingRow({ colors, icon, iconColor, label, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + "22" }]}>
        <Feather name={icon} size={17} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function StatItem({ colors, label, value }: { colors: any; label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  sectionTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 1, paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  settingRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  smsCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8, gap: 10 },
  smsHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  smsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  smsTitle: { fontSize: 14, fontWeight: "600" },
  smsSubtitle: { fontSize: 12, marginTop: 1 },
  smsDesc: { fontSize: 12, lineHeight: 18 },
  lastScanText: { fontSize: 11 },
  resultBanner: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  resultText: { fontSize: 13, fontWeight: "600" },
  smsBtns: { flexDirection: "row", gap: 8 },
  smsBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  smsBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  smsBanks: { flexDirection: "row", flexWrap: "wrap" },
  smsBanksLabel: { fontSize: 11 },
  securityCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  secRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  secIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  secToggle: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  lockNowBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#1E2A3A" },
  lockNowText: { fontSize: 13 },
  infoCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 13 },
  templateCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8, gap: 6 },
  templateHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  templateBank: { flex: 1, fontSize: 14, fontWeight: "600" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: "600" },
  templateDesc: { fontSize: 12 },
  statsCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8, gap: 12 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: "600" },
  dangerBtn: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  dangerText: { color: "#F43F5E", fontSize: 15, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16, opacity: 0.4 },
  modalTitle: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6, marginTop: 4 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, marginBottom: 12, textAlign: "right" },
  bankChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginBottom: 12 },
  catBtnText: { flex: 1, fontSize: 14, fontWeight: "600" },
  errorText: { fontSize: 13, marginBottom: 8, textAlign: "center" },
  addBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pinModal: { flex: 1, alignItems: "center", justifyContent: "center" },
  pinClose: { position: "absolute", top: 60, right: 24 },
});