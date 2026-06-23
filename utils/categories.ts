export interface Category {
  id: string;
  nameAr: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "food",          nameAr: "طعام وشراب",   icon: "coffee",      color: "#F59E0B" },
  { id: "groceries",     nameAr: "بقالة",         icon: "shopping-bag", color: "#10B981" },
  { id: "transport",     nameAr: "مواصلات",       icon: "truck",        color: "#3B82F6" },
  { id: "health",        nameAr: "صحة",           icon: "heart",        color: "#F43F5E" },
  { id: "education",     nameAr: "تعليم",         icon: "book",         color: "#8B5CF6" },
  { id: "entertainment", nameAr: "ترفيه",         icon: "tv",           color: "#EC4899" },
  { id: "utilities",     nameAr: "خدمات",         icon: "zap",          color: "#06B6D4" },
  { id: "shopping",      nameAr: "تسوق",          icon: "tag",          color: "#F97316" },
  { id: "transfers",     nameAr: "تحويلات",       icon: "repeat",       color: "#6366F1" },
  { id: "government",    nameAr: "حكومي",         icon: "flag",         color: "#14B8A6" },
  { id: "subscriptions", nameAr: "اشتراكات",      icon: "refresh-cw",   color: "#A855F7" },
  { id: "other",         nameAr: "أخرى",          icon: "more-horizontal", color: "#8B949E" },
  { id: "uncategorized", nameAr: "غير مصنف",      icon: "help-circle",  color: "#4F8EF7" },
];

const CATEGORY_MAP = new Map<string, Category>(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategoryById(id: string): Category {
  return CATEGORY_MAP.get(id) ?? CATEGORY_MAP.get("uncategorized")!;
}
