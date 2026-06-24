<div align="center">

<img src="assets/images/icon.png" alt="PureWallet" width="110" height="110" style="border-radius: 22px;" />

# PureWallet

**تطبيق أندرويد محلي لتتبع مصروفاتك تلقائياً من رسائل SMS البنكية**

[![CI](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml/badge.svg)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml)
[![Build](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml/badge.svg)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native 0.81](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)

### [⬇️ تحميل APK — v2.0.0](https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk)

> لا إنترنت · لا سحابة · لا بيانات تغادر هاتفك

</div>

---

## ما هو PureWallet؟

PureWallet تطبيق **مفتوح المصدر** يقرأ رسائل SMS من بنوكك السعودية، يستخرج العمليات المالية تلقائياً، ويساعدك على تتبع إنفاقك وإدارة ميزانيتك — كل ذلك **محلياً على جهازك تماماً**.

---

## الميزات

| | الميزة | التفاصيل |
|---|--------|----------|
| 📩 | **قراءة SMS تلقائية** | يستورد عمليات الدفع من رسائل البنوك فور فتح التطبيق |
| 🔍 | **محرك Regex متقدم** | يستخرج البنك + المبلغ + المتجر + التوقيت بدقة |
| 🚫 | **فلتر OTP** | يتجاهل رسائل التحقق والرموز تلقائياً |
| 📊 | **ميزانية شهرية** | حدد سقفاً لكل فئة مع شريط تقدم بصري وتنبيه عند الاقتراب |
| 💡 | **اقتراح ميزانية ذكي** | يحسب متوسط إنفاقك في الأشهر الثلاثة الماضية ويقترح حدوداً |
| 🗂️ | **تصنيف ذكي** | يتذكر تصنيف كل متجر ويطبقه مستقبلاً |
| 🔒 | **خصوصية كاملة** | لا إنترنت، لا analytics، لا سحابة |
| ✍️ | **إدخال يدوي** | أضف عمليات يدوياً بأي وقت |
| 🔑 | **رمز سري + بيومتري** | حماية التطبيق ببصمة الإصبع أو رمز 4 أرقام |

---

## البنوك المدعومة

| البنك | عدد قوالب SMS |
|-------|--------------|
| 🏦 بنك الراجحي | 3 |
| 🏦 البنك الأهلي السعودي | 3 |
| 🏦 بنك الرياض | 2 |
| 🏦 بنك ساب | 2 |
| 🏦 بنك البلاد | 2 |
| 🏦 بنك الجزيرة | 2 |

---

## تثبيت التطبيق

### الطريقة المباشرة — APK جاهز للتنزيل

**[⬇️ تحميل PureWallet-v2.0.0.apk](https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk)**

1. حمّل الملف من الرابط أعلاه
2. في هاتفك: **الإعدادات ← الأمان ← السماح بتثبيت تطبيقات من مصادر غير معروفة**
3. افتح ملف الـ APK وثبّت التطبيق

> **الحجم:** ~88 MB &nbsp;·&nbsp; **الحد الأدنى:** Android 6.0 (API 23)+

---

## البناء من المصدر

```bash
# استنساخ المشروع
git clone https://github.com/taroq4-2/PureWallet-os73.git
cd PureWallet-os73

# تثبيت الحزم
npm install

# تشغيل بيئة التطوير (Expo Go)
npx expo start
```

لبناء APK محلي:
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## المكدس التقني

| التقنية | الإصدار | الدور |
|---------|---------|-------|
| **React Native** | 0.81 | إطار التطبيق الأساسي |
| **Expo SDK** | 54 | بيئة البناء والتطوير |
| **expo-router** | 6.x | التنقل بين الشاشات |
| **TypeScript** | 5.9 | سلامة الأنواع الكاملة |
| **react-native-get-sms-android** | 2.1 | قراءة رسائل SMS (مفتوح المصدر) |
| **AsyncStorage** | 2.x | التخزين المحلي المشفر |
| **react-native-svg** | 15.x | الرسوم البيانية الدائرية |
| **react-native-reanimated** | 4.x | الرسوم المتحركة |
| **Zod** | 3.x | التحقق من صحة البيانات |
| **react-native-local-authentication** | 17.x | البيومتري والرمز السري |

---

## هيكل المشروع

```
PureWallet-os73/
├── app/
│   ├── _layout.tsx              # Root layout + جميع الـ Providers
│   └── (tabs)/
│       ├── index.tsx            # لوحة التحكم + الرسم الدائري
│       ├── uncategorized.tsx    # صندوق العمليات غير المصنفة
│       ├── transactions.tsx     # السجل الكامل + البحث والفلترة
│       ├── budget.tsx           # الميزانية الشهرية بالفئات
│       └── settings.tsx        # الإعدادات + SMS + الأمان
├── context/
│   ├── TransactionsContext.tsx  # حالة العمليات المالية
│   ├── SmsContext.tsx           # قراءة SMS وإدارة الصلاحيات
│   ├── BudgetContext.tsx        # الميزانية الشهرية
│   └── AuthContext.tsx          # الرمز السري والبيومتري
├── utils/
│   ├── bankTemplates.ts         # قوالب Regex لكل بنك
│   ├── smsParser.ts             # محرك تحليل الرسائل
│   ├── smsStorage.ts            # تخزين حالة SMS (معرفات مُقروءة، وقت آخر مسح)
│   └── storage.ts               # AsyncStorage helpers
└── .github/workflows/
    ├── ci.yml                   # TypeScript typecheck عند كل push
    └── build-android.yml        # بناء APK تلقائي وتسليمه كـ artifact
```

---

## كيف تعمل قراءة SMS؟

```
رسالة SMS واردة من البنك
        │
        ▼
فحص OTP ──► رمز تحقق؟ → تجاهل فوري 🛑
        │
        ▼
Regex Engine (bankTemplates.ts)
        │
        ▼
استخراج: [ بنك | مبلغ | متجر | تاريخ ]
        │
        ▼
تحقق من قاعدة بيانات المتاجر المصنفة
        ├── متجر معروف ──► تصنيف تلقائي ✅
        └── متجر جديد ──► صندوق "غير مصنف" 📥
        │
        ▼
تخزين في AsyncStorage (محلياً على الجهاز)
```

---

## الخصوصية والأمان

| | البند |
|---|-------|
| ✅ | **لا إنترنت** — التطبيق لا يتصل بأي خادم خارجي |
| ✅ | **معالجة محلية** — كل الـ Regex يعمل على جهازك فقط |
| ✅ | **فلتر OTP** — رموز التحقق لا تُخزّن إطلاقاً |
| ✅ | **مفتوح المصدر** — يمكنك مراجعة كل سطر كود |
| ✅ | **الصلاحيات المطلوبة فقط:** `READ_SMS` و `USE_BIOMETRIC` |

---

## الشاشات والتبويبات

| التبويب | الوصف |
|---------|-------|
| **الرئيسية** | ملخص الشهر + رسم دائري بالفئات + آخر 5 عمليات |
| **غير مصنف** | صندوق العمليات التي تحتاج تصنيفاً مع عداد |
| **العمليات** | السجل الكامل مع بحث نصي وفلتر بالفئة والبنك |
| **الميزانية** | حدود إنفاق شهرية بالفئة + اقتراح تلقائي |
| **الإعدادات** | إعداد SMS + الأمان + إدخال يدوي + قوالب البنوك |

---

## الرخصة

هذا المشروع مرخص بموجب **MIT** — انظر ملف [LICENSE](LICENSE)

---

<div align="center">

**[⬇️ تحميل APK — v2.0.0](https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk)**

صُنع بـ ❤️ لمن يريد تتبع مصروفاته بخصوصية تامة

*PureWallet — محفظتك، بياناتك، جهازك.*

</div>
