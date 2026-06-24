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

/** Keyword map for auto-categorising imported SMS transactions (Arabic + English). */
const MERCHANT_KEYWORDS: { keywords: string[]; categoryId: string }[] = [
  {
    categoryId: "groceries",
    keywords: ["كارفور", "لولو", "بندة", "العثيم", "المزرعة", "أسواق", "hypermarket", "carrefour", "lulu", "panda", "danube", "tamimi"],
  },
  {
    categoryId: "fuel",
    keywords: ["الديار", "aramco", "توتال", "shell", "esso", "caltex", "زجاجة", "محطة", "وقود", "بنزين", "petro"],
  },
  {
    categoryId: "cafes",
    keywords: ["ستاربكس", "starbucks", "دانكن", "dunkin", "كوستا", "costa", "تيم هورتنز", "tim hortons", "باتشينو", "caffe"],
  },
  {
    categoryId: "restaurants",
    keywords: ["ماكدونالدز", "mcdonald", "برجر كنج", "burger king", "كنتاكي", "kfc", "هرفي", "harveys", "صب ويه", "subway", "بيتزا", "pizza", "مطعم", "restaurant", "طازج", "الطازج"],
  },
  {
    categoryId: "entertainment",
    keywords: ["سينما", "cinema", "vox", "امك", "amk", "playstation", "xbox", "netflix", "انستقرام", "سبوتيفاي", "spotify", "فوجو"],
  },
  {
    categoryId: "health",
    keywords: ["صيدلية", "مستشفى", "عيادة", "pharmacy", "hospital", "clinic", "نهدي", "nahdi", "الدواء", "طبيب"],
  },
  {
    categoryId: "shopping",
    keywords: ["h&m", "زارا", "zara", "نايكي", "nike", "اديداس", "adidas", "سوق", "noon", "amazon", "نون", "اكسس", "gap"],
  },
  {
    categoryId: "transport",
    keywords: ["أوبر", "uber", "كريم", "careem", "تاكسي", "taxi", "ليفت", "lyft", "جاهز", "sa taxi"],
  },
  {
    categoryId: "utilities",
    keywords: ["stc", "موبايلي", "زين", "zain", "كهرباء", "ماء", "المياه", "electricity", "water", "internet"],
  },
];

/**
 * Guesses a category ID from a merchant name.
 * Returns "uncategorized" when no keyword matches.
 */
export function getCategoryByMerchant(merchantName: string): string {
  const lower = merchantName.toLowerCase();
  for (const { keywords, categoryId } of MERCHANT_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return categoryId;
  }
  return "uncategorized";
}
