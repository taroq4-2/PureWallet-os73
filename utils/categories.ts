export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "groceries",    nameAr: "البقالة",      nameEn: "Groceries",      icon: "shopping-cart", color: "#10B981" },
  { id: "fuel",         nameAr: "الوقود",        nameEn: "Fuel",           icon: "zap",           color: "#F59E0B" },
  { id: "cafes",        nameAr: "المقاهي",       nameEn: "Cafes",          icon: "coffee",        color: "#8B5CF6" },
  { id: "restaurants",  nameAr: "المطاعم",       nameEn: "Restaurants",    icon: "grid",          color: "#EF4444" },
  { id: "entertainment",nameAr: "الترفيه",       nameEn: "Entertainment",  icon: "tv",            color: "#EC4899" },
  { id: "health",       nameAr: "الصحة",         nameEn: "Health",         icon: "heart",         color: "#F43F5E" },
  { id: "shopping",     nameAr: "التسوق",        nameEn: "Shopping",       icon: "tag",           color: "#3B82F6" },
  { id: "transport",    nameAr: "المواصلات",     nameEn: "Transport",      icon: "navigation",    color: "#14B8A6" },
  { id: "utilities",    nameAr: "الخدمات",       nameEn: "Utilities",      icon: "tool",          color: "#6366F1" },
  { id: "other",        nameAr: "أخرى",          nameEn: "Other",          icon: "more-horizontal",color: "#94A3B8" },
];

export const UNCATEGORIZED_CATEGORY: Category = {
  id: "uncategorized",
  nameAr: "غير مصنف",
  nameEn: "Uncategorized",
  icon: "help-circle",
  color: "#475569",
};

export function getCategoryById(id: string): Category {
  if (id === "uncategorized") return UNCATEGORIZED_CATEGORY;
  return CATEGORIES.find((c) => c.id === id) ?? UNCATEGORIZED_CATEGORY;
}
