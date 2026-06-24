<div align="center">

<img src="assets/images/icon.png" alt="PureWallet Logo" width="120" style="border-radius: 24px;" /><br/><br/>

# PureWallet

### تطبيق أندرويد مفتوح المصدر لتتبع مصروفاتك تلقائياً من رسائل SMS البنكية

<br/>

[![CI](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/ci.yml)
[![Build APK](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml/badge.svg?branch=main)](https://github.com/taroq4-2/PureWallet-os73/actions/workflows/build-android.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/taroq4-2/PureWallet-os73?label=إصدار&color=6C63FF)](https://github.com/taroq4-2/PureWallet-os73/releases/latest)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native 0.81](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

<br/>

<a href="https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk">
  <img src="https://img.shields.io/badge/⬇️%20%20تحميل%20APK%20-%20v2.0.0-6C63FF?style=for-the-badge" alt="Download APK" height="44" />
</a>

<br/><br/>

> **🔒 لا إنترنت · لا سحابة · لا تتبع · بياناتك تبقى على جهازك فقط**

</div>

---

## 📖 نظرة عامة

**PureWallet** هو تطبيق أندرويد **مجاني ومفتوح المصدر** يقرأ رسائل SMS الواردة من بنوكك السعودية، يستخرج العمليات المالية تلقائياً، ويساعدك على فهم إنفاقك وإدارة ميزانيتك الشهرية — كل ذلك **محلياً على جهازك** دون إرسال أي بيانات للإنترنت.

بُني التطبيق على مبدأين أساسيين:
- **الخصوصية أولاً** — لا سيرفر، لا قاعدة بيانات سحابية، لا analytics
- **الشفافية الكاملة** — الكود مفتوح المصدر بالكامل، يمكنك مراجعة كل سطر

---

## ✨ الميزات الرئيسية

| الميزة | التفاصيل |
|--------|----------|
| **📩 استيراد SMS تلقائي** | يقرأ رسائل البنوك فور فتح التطبيق أو عند العودة إليه |
| **🎯 تصفية بالمرسل** | يتعرف على البنك من اسم المرسل (AlRajhiBank، SNB-AIAhli) حتى لو لم يُذكر اسم البنك في نص الرسالة |
| **🚫 تجاهل OTP تلقائياً** | يفلتر رسائل رموز التحقق والكلمات المؤقتة دون تخزينها |
| **📊 ميزانية شهرية** | حدد سقفاً لكل فئة مع شريط تقدم بصري وتنبيه عند الاقتراب |
| **💡 اقتراح ميزانية ذكي** | يحسب متوسط إنفاقك في الأشهر الثلاثة الماضية ويقترح حدوداً |
| **🗂️ تصنيف ذكي للمتاجر** | يتذكر تصنيفك لكل متجر ويطبقه تلقائياً في المستقبل |
| **✍️ إدخال يدوي** | أضف عمليات يدوياً بأي وقت بدون الاعتماد على SMS |
| **🔑 حماية بالرمز السري** | قفل التطبيق برمز 4 أرقام أو بصمة الإصبع |
| **📈 رسم دائري تفاعلي** | توزيع الإنفاق بالفئات بصرياً على الصفحة الرئيسية |
| **🌙 واجهة داكنة كاملة** | تصميم داكن أنيق مريح للعيون |

---

## 🏦 البنوك المدعومة

يتعرف التطبيق على البنوك **باسم المرسل أولاً** (sender-first routing) ثم بمحتوى الرسالة كخط دفاع ثانٍ:

| البنك | أسماء المرسلين (Sender IDs) | نوع الرسائل المدعومة |
|-------|----------------------------|----------------------|
| 🏦 **بنك الراجحي** | `AlRajhiBank` | خصم البطاقة · شراء · سحب |
| 🏦 **البنك الأهلي السعودي** | `SNB-AIAhli` · `SNB` · `NCBSms` | خصم البطاقة · تحويل · شراء |
| 🏦 **البنك العربي الوطني** | `ANBSaudi` · `ANB` | خصم البطاقة · شراء |
| 🏦 **بنك الرياض** | `RiyadBank` · `RIYAD` | خصم البطاقة · شراء |

> 💡 يدعم التطبيق الرسائل العربية والإنجليزية، وأسماء المتاجر التي تحتوي على نقطة مثل `NOON.COM` و `AMAZON.COM`.

---

## ⬇️ التثبيت

### الطريقة الأسرع — APK جاهز للتنزيل

<a href="https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk">
  <img src="https://img.shields.io/badge/⬇️%20%20PureWallet--v2.0.0.apk%20%20(~88%20MB)-6C63FF?style=for-the-badge" alt="Download APK" />
</a>

**خطوات التثبيت:**

1. اضغط الزر أعلاه لتحميل ملف APK
2. في هاتفك: **الإعدادات ← الأمان ← السماح بتثبيت تطبيقات من مصادر غير معروفة**
3. افتح ملف APK المحمَّل وثبّت التطبيق
4. افتح PureWallet واضغط "منح الصلاحية" للسماح بقراءة رسائل البنك

| المتطلب | الحد الأدنى |
|---------|-------------|
| نظام التشغيل | Android 6.0 (API 23)+ |
| حجم التثبيت | ~88 MB |
| الصلاحيات | `READ_SMS` · `USE_BIOMETRIC` (اختياري) |

---

## 🛠️ البناء من المصدر

**المتطلبات:** Node.js 20+ · npm

```bash
# استنساخ المشروع
git clone https://github.com/taroq4-2/PureWallet-os73.git
cd PureWallet-os73

# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npx expo start --android
```

**لبناء APK:**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview --local
```

**التحقق من الكود:**
```bash
npm run typecheck
```

---

## 🗂️ هيكل المشروع

```
PureWallet-os73/
├── app/
│   ├── _layout.tsx              # Root layout + جميع Providers
│   └── (tabs)/
│       ├── index.tsx            # الرئيسية: ملخص + رسم دائري
│       ├── uncategorized.tsx    # صندوق العمليات غير المصنفة
│       ├── transactions.tsx     # السجل الكامل + بحث + فلتر
│       ├── budget.tsx           # الميزانية الشهرية بالفئات
│       └── settings.tsx         # الإعدادات + SMS + الأمان
│
├── context/
│   ├── SmsContext.tsx           # قراءة SMS وإدارة الصلاحيات
│   ├── TransactionsContext.tsx  # حالة العمليات المالية
│   ├── BudgetContext.tsx        # الميزانية الشهرية
│   └── AuthContext.tsx          # الرمز السري والبيومتري
│
├── utils/
│   ├── smsParser.ts             # محرك التحليل — sender-first routing
│   ├── smsStorage.ts            # حالة SMS (معرفات مقروءة، آخر مسح)
│   ├── bankTemplates.ts         # قوالب Regex للعرض في الواجهة
│   └── banks/
│       ├── AlRajhiParser.ts     # محلل رسائل الراجحي
│       ├── SNBParser.ts         # محلل رسائل الأهلي السعودي
│       ├── ANBParser.ts         # محلل رسائل العربي الوطني
│       ├── RiyadParser.ts       # محلل رسائل بنك الرياض
│       └── index.ts
│
└── .github/
    └── workflows/
        ├── ci.yml               # TypeScript check عند كل push
        └── build-android.yml    # بناء APK تلقائي ورفعه كـ Release
```

---

## 🔄 كيف يعمل محرك SMS؟

```
رسالة SMS واردة
       │
       ▼
┌─────────────────────────────────┐
│  1. فلتر OTP                   │
│  رمز تحقق؟ → تجاهل فوري  🛑  │
└─────────────────────────────────┘
       │ ليست OTP
       ▼
┌─────────────────────────────────┐
│  2. تحديد البنك من المرسل      │
│  AlRajhiBank  → الراجحي   ✓   │
│  SNB-AIAhli   → الأهلي    ✓   │
│  مرسل مجهول  → الخطوة 3       │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  3. تحليل نص الرسالة (Regex)   │
│  استخراج: مبلغ + متجر + تاريخ │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  4. قاعدة بيانات المتاجر       │
│  متجر معروف → تصنيف تلقائي ✅ │
│  متجر جديد  → صندوق انتظار 📥 │
└─────────────────────────────────┘
       │
       ▼
  AsyncStorage — محلي على الجهاز
```

---

## 🔒 الخصوصية والأمان

PureWallet مُصمَّم من البداية بمبدأ **"الخصوصية أولاً"** — لا توجد أي استثناءات:

| البند | التفاصيل |
|-------|----------|
| ✅ **لا اتصال بالإنترنت** | التطبيق لا يتصل بأي خادم خارجي في أي وقت |
| ✅ **لا analytics** | لا Firebase، لا Crashlytics، لا أي SDK للتتبع |
| ✅ **معالجة محلية كاملة** | كل التحليل يعمل على جهازك دون مغادرة أي بيانات |
| ✅ **فلتر OTP صارم** | رموز التحقق تُرفض فوراً ولا تُخزَّن إطلاقاً |
| ✅ **تشفير التخزين** | البيانات محمية بتشفير Android الافتراضي |
| ✅ **صلاحيات محدودة** | يطلب فقط: `READ_SMS` و `USE_BIOMETRIC` (اختياري) |
| ✅ **مفتوح المصدر** | كل سطر من الكود متاح للمراجعة على GitHub |

**الإبلاغ عن ثغرات أمنية:** افتح [GitHub Issue](https://github.com/taroq4-2/PureWallet-os73/issues/new) مع وضع `[SECURITY]` في العنوان.

---

## 🤝 المساهمة

نرحب بأي مساهمة! إليك كيفية البدء:

```bash
# Fork المشروع ثم استنسخ نسختك
git clone https://github.com/YOUR_USERNAME/PureWallet-os73.git
cd PureWallet-os73

# أنشئ فرع جديد
git checkout -b feat/اسم-الميزة

# أجرِ تعديلاتك وتحقق من الأنواع
npm run typecheck

# ادفع وافتح Pull Request
git push origin feat/اسم-الميزة
```

**أولويات المساهمة الحالية:**
- 🏦 دعم بنوك إضافية (ساب، البلاد، الجزيرة، النماء)
- 🧪 كتابة اختبارات وحدة لمحلل الرسائل
- 🌐 دعم اللغة الإنجليزية (i18n)
- 🐛 الإبلاغ عن رسائل SMS لا يتعرف عليها التطبيق

---

## 📋 سجل التغييرات

### v2.0.0 — يونيو 2026
- ✅ **Sender-first routing** — التعرف على AlRajhiBank وSNB-AIAhli من اسم المرسل مباشرةً
- ✅ **دعم أسماء متاجر بنقطة** — NOON.COM، AMAZON.COM
- ✅ **تنظيف أفضل لأسماء المتاجر** في الرسائل العربية والإنجليزية
- ✅ **واجهة SMS محسّنة** — تعرض أسماء المرسلين المدعومة
- ✅ **CI/CD مستقر** — TypeScript check + بناء APK تلقائي عند كل تحديث

### v1.0.0 — يونيو 2026
- 🎉 الإطلاق الأول: قراءة SMS، الميزانية، التصنيف، الأمان البيومتري

---

## 📦 المكدس التقني

| التقنية | الإصدار | الدور |
|---------|---------|-------|
| React Native | 0.81 | إطار التطبيق الأساسي |
| Expo SDK | 54 | بيئة البناء والتطوير |
| expo-router | 6.x | التنقل بين الشاشات |
| TypeScript | 5.9 | سلامة الأنواع الكاملة |
| react-native-get-sms-android | 2.1 | قراءة رسائل SMS |
| AsyncStorage | 2.x | التخزين المحلي |
| react-native-svg | 15.x | الرسوم البيانية الدائرية |
| react-native-reanimated | 4.x | الرسوم المتحركة السلسة |
| expo-local-authentication | 17.x | البيومتري والرمز السري |
| Zod | 3.x | التحقق من صحة البيانات |

---

## 📄 الرخصة

هذا المشروع مرخص بموجب **MIT License** — انظر ملف [LICENSE](LICENSE) للتفاصيل.

يمكنك بحرية: الاستخدام · النسخ · التعديل · التوزيع · الاستخدام التجاري

---

<div align="center">

**[⬇️ تحميل PureWallet-v2.0.0.apk](https://github.com/taroq4-2/PureWallet-os73/releases/download/v2.0.0/PureWallet-v2.0.0.apk)**

<br/>

<sub>صُنع بـ ❤️ لكل من يريد تتبع مصروفاته بخصوصية تامة</sub><br/>
<sub><i>PureWallet — محفظتك، بياناتك، جهازك.</i></sub>

</div>
