import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/images/icon.png");

interface LinkRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  url: string;
  accent?: string;
}

function LinkRow({ icon, label, value, url, accent }: LinkRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.linkRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: (accent ?? colors.primary) + "22" }]}>
        <Feather name={icon} size={20} color={accent ?? colors.primary} />
      </View>
      <View style={styles.linkText}>
        <Text style={[styles.linkLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.linkValue, { color: colors.foreground }]}>{value}</Text>
      </View>
      <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} resizeMode="cover" />
        <Text style={[styles.appName, { color: colors.foreground }]}>PureWallet</Text>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>الإصدار 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>تواصل معنا</Text>

        <LinkRow
          icon="globe"
          label="الموقع الإلكتروني"
          value="www.os73.com"
          url="https://www.os73.com"
          accent="#3B82F6"
        />

        <LinkRow
          icon="instagram"
          label="انستغرام"
          value="@Taro0q"
          url="https://www.instagram.com/Taro0q"
          accent="#E1306C"
        />

        <LinkRow
          icon="github"
          label="GitHub"
          value="PureWallet-os73"
          url="https://github.com/taroq4-2/PureWallet-os73"
          accent={colors.foreground}
        />
      </View>

      <View style={[styles.duaCard, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}>
        <Feather name="heart" size={22} color="#F43F5E" style={{ marginBottom: 14 }} />
        <Text style={[styles.duaText, { color: colors.foreground }]}>
          إذا استفدتَ من التطبيق
        </Text>
        <Text style={[styles.duaHighlight, { color: colors.primary }]}>
          لا تنسانا من دعائك
        </Text>
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        صُنع بـ OS73
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 110,
    alignItems: "center",
  },
  header: { alignItems: "center", marginBottom: 36 },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 26,
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  version: { fontSize: 13 },
  section: { width: "100%", marginBottom: 28 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "right",
  },
  linkRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { flex: 1, alignItems: "flex-end" },
  linkLabel: { fontSize: 11, marginBottom: 2 },
  linkValue: { fontSize: 15, fontWeight: "600" },
  duaCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  duaText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  duaHighlight: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 34,
  },
  footer: { fontSize: 12 },
});
