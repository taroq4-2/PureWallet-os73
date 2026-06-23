import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { CATEGORIES, Category } from "@/utils/categories";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  selectedId?: string;
}

export function CategorySelector({ visible, onClose, onSelect, selectedId }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleSelect = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(cat);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>اختر فئة</Text>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    backgroundColor: selected ? item.color + "33" : colors.secondary,
                    borderColor: selected ? item.color : "transparent",
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.color + "22" }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.itemLabel, { color: colors.foreground }]} numberOfLines={1}>
                  {item.nameAr}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
    opacity: 0.4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  item: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
