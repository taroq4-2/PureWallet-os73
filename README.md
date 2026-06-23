<div align="center">

<img src="assets/images/icon.png" alt="PureWallet Logo" width="120" height="120" style="border-radius: 24px;" />

# PureWallet

**تطبيق محلي ومشفر لتتبع مصروفاتك البنكية تلقائياً من رسائل SMS**

[![CI](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml/badge.svg)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml)
[![Build Android APK](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml/badge.svg)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://typescriptlang.org)

</div>

---

## نظرة عامة

**PureWallet** هو تطبيق أندرويد محلي بالكامل *(Local-First)* مبني بتقنية **React Native / Expo**، مصمم لتتبع وتصنيف المصروفات تلقائياً عن طريق تحليل رسائل SMS البنكية الواردة على هاتفك.

> **لا إنترنت — لا سحابة — لا بيانات تغادر هاتفك.**

---

## الميزات الرئيسية

| الميزة | التفاصيل |
|--------|----------|
| 🔍 **محرك تحليل SMS** | يستخرج المبلغ والمتجر والبنك تلقائياً بالـ Regex |
| 🛡️ **فلتر OTP** | يتجاهل رسائل التحقق والرموز المؤقتة فوراً |
| 🔒 **تخزين مشفر** | كل البيانات محلية ومشفرة على الجهاز |
| 📊 **لوحة تحكم** | رسم بياني دائري تفاعلي + توزيع حسب الفئة |
| 🗂️ **تصنيف ذكي** | يتذكر تصنيف كل متجر ويطبقه تلقائياً في المستقبل |
| 🔎 **بحث وتصفية** | بحث نصي + فلترة حسب الفئة والبنك |
| ✍️ **إدخال يدوي** | أضف عمليات يدوياً من أي بنك |
| 🏦 **5 بنوك سعودية** | الراجحي، الأهلي، الرياض، ساب، البلاد |

---

## البنوك المدعومة

| البنك | الاسم الإنجليزي | القوالب |
|-------|----------------|---------|
| 🏦 بنك الراجحي | Al Rajhi Bank | 3 قوالب |
| 🏦 البنك الأهلي السعودي | Saudi National Bank (SNB) | 3 قوالب |
| 🏦 بنك الرياض | Riyad Bank | 2 قوالب |
| 🏦 بنك ساب | SABB | 2 قوالب |
| 🏦 بنك البلاد | Bank Albilad | 2 قوالب |

---

## الشاشات

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   الرئيسية      │  │  غير المصنف     │  │   العمليات      │  │   الإعدادات     │
│                 │  │                 │  │                 │  │                 │
│  1,820 ر.س      │  │  ⚠ 2 عمليات    │  │  🔍 بحث...      │  │  + عملية يدوية │
│                 │  │                 │  │                 │  │                 │
│   [دائري]       │  │  • متجر XYZ     │  │  الكل │ بقالة.. │  │  🔒 أمان        │
│                 │  │    صنّف ←       │  │                 │  │                 │
│  بقالة  25%     │  │  • متجر جديد    │  │  • بنده 152.5   │  │  📋 القوالب     │
│  صحة    18%     │  │    صنّف ←       │  │  • ستاربكس 45   │  │                 │
│  وقود   11%     │  │                 │  │  • محطة شل 200  │  │  ⚠ حذف الكل   │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## المعمارية التقنية (Architecture)

```
[رسالة SMS واردة]
        │
        ▼
[فحص OTP Keywords] ──► إذا OTP: تجاهل فوراً 🛑
        │
        ▼
[محرك Regex — BankPatterns[]]
        │
        ▼
[استخراج: بنك + مبلغ + متجر + وقت]
        │
        ▼
[فحص جدول Merchant→Category]
        ├── متجر معروف ──► تصنيف تلقائي ✅
        └── متجر جديد ──► وضع "غير مصنف" 📥
                                │
                                ▼
                    [إشعار في تبويب "غير المصنف"]
        │
        ▼
[تخزين مشفر — AsyncStorage (AES-256)]
        │
        ▼
[عرض في الواجهة — React Native Screens]
```

---

## الهيكل البرمجي

```
PureWallet-os73/
├── app/
│   ├── _layout.tsx              # Root layout + Providers
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar (4 tabs)
│       ├── index.tsx            # Dashboard + Donut Chart
│       ├── uncategorized.tsx    # Uncategorized inbox
│       ├── transactions.tsx     # Full history + Search
│       └── settings.tsx        # Settings + Manual entry
├── components/
│   ├── TransactionCard.tsx      # Transaction list item
│   ├── DonutChart.tsx           # SVG donut chart
│   ├── CategorySelector.tsx     # Bottom sheet category picker
│   └── EmptyState.tsx           # Empty state component
├── context/
│   └── TransactionsContext.tsx  # Global state + AsyncStorage
├── utils/
│   ├── categories.ts            # 10 categories with icons/colors
│   ├── smsParser.ts             # Regex parsing engine
│   ├── storage.ts               # AsyncStorage helpers
│   └── bankTemplates.ts         # Bank template metadata
├── constants/
│   └── colors.ts                # Dark fintech theme tokens
└── assets/
    └── images/
        └── icon.png             # App icon
```

---

## المكدس التقني (Tech Stack)

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| React Native | 0.81 | إطار التطبيق |
| Expo SDK | 54 | بيئة التطوير والبناء |
| expo-router | 6.x | التنقل بين الشاشات |
| react-native-svg | 15.x | الرسوم البيانية |
| AsyncStorage | 2.x | التخزين المحلي المشفر |
| TypeScript | 5.9 | سلامة الأنواع |
| react-native-reanimated | 4.x | الرسوم المتحركة |

---

## التثبيت والتشغيل المحلي

### المتطلبات
- Node.js 18+
- pnpm أو npm
- تطبيق [Expo Go](https://expo.dev/go) على هاتفك (للتجربة)

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/taroq4-2/PureWallet-os73.git
cd PureWallet-os73

# 2. تثبيت المكتبات
npm install

# 3. تشغيل خادم التطوير
npx expo start

# 4. امسح QR Code بتطبيق Expo Go
```

---

## بناء ملف APK

### المتطلبات
- حساب مجاني على [expo.dev](https://expo.dev)
- EAS CLI

```bash
# 1. تثبيت EAS CLI
npm install -g eas-cli

# 2. تسجيل الدخول
eas login

# 3. ضبط المشروع (مرة واحدة)
eas build:configure

# 4. بناء APK للتوزيع المباشر
eas build --platform android --profile preview

# 5. بعد ~15 دقيقة، تحصل على رابط تحميل APK مباشر
```

---

## GitHub Actions

يحتوي المشروع على workflow تلقائيين:

### 1. CI — فحص الكود
يُشغَّل تلقائياً عند كل `push` أو `pull request`:
- ✅ TypeScript typecheck
- ✅ فحص صياغة الكود

### 2. Build Android APK
يُشغَّل تلقائياً عند الـ push على `main`:
- 🔨 بناء APK عبر EAS Build Cloud
- 📦 رفع الـ APK كـ artifact قابل للتحميل

#### إعداد GitHub Secrets المطلوبة
```
EXPO_TOKEN  →  رمز المصادقة من expo.dev/settings/access-tokens
```

---

## الأمان والخصوصية

- **لا صلاحية إنترنت** — التطبيق لا يطلب `INTERNET` permission للبيانات
- **تشفير محلي** — جميع البيانات مخزنة محلياً بتشفير AES-256
- **فلتر OTP** — رسائل التحقق تُتلف فوراً من الذاكرة
- **لا نسخ احتياطي** — `android:allowBackup="false"` معطّل
- **تحليل أمني** — مصمم لاجتياز فحص MobSF

---

## الفئات المدعومة

| الفئة | الأيقونة | اللون |
|-------|---------|-------|
| البقالة | 🛒 | أخضر |
| الوقود | ⚡ | برتقالي |
| المقاهي | ☕ | بنفسجي |
| المطاعم | 🍽️ | أحمر |
| الترفيه | 📺 | وردي |
| الصحة | ❤️ | أحمر فاتح |
| التسوق | 🏷️ | أزرق |
| المواصلات | 🧭 | فيروزي |
| الخدمات | 🔧 | نيلي |
| أخرى | ⋯ | رمادي |

---

## المساهمة

```bash
# 1. Fork المشروع
# 2. أنشئ فرعاً جديداً
git checkout -b feature/amazing-feature

# 3. اعمل تغييراتك وفحص الكود
npm run typecheck

# 4. commit وpush
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature

# 5. افتح Pull Request
```

---

## الترخيص

هذا المشروع مرخص بموجب رخصة **MIT** — انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

<div align="center">

صُنع بـ ❤️ لتسهيل إدارة المصروفات اليومية

**PureWallet** — محفظتك، خصوصيتك، بياناتك.

</div>
