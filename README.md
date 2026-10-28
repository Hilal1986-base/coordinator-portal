# بوابة المنسقين في دائرة المعلوماتية

بوابة لرفع الملفات وإرسالها عبر البريد الإلكتروني، مع نظام مصادقة كامل ولوحة تحكم للأدمين.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

> 📖 وثائق كاملة بالعربية — استخدم زر الترجمة في المتصفح إذا لزم الأمر.

## المميزات

### 🧑‍💼 للمنسقين:
- ✅ تسجيل حساب (الاسم + البريد + كلمة المرور + اختيار الدائرة)
- ✅ تسجيل الدخول والخروج
- ✅ استعادة كلمة المرور عبر البريد
- ✅ رفع ملف (السحب والإفلات أو الاختيار)
- ✅ إرسال الملف إلى أي بريد مع رسالة مرفقة
- ✅ سجل شخصي بالإرسالات مع تنزيل الملفات
- ✅ كل منسق يرى إرسالاته فقط

### 🎛️ للمدير:
- ✅ لوحة تحكم على `/dashboard`
- ✅ إحصائيات شاملة
- ✅ إدارة المنسقين (عرض + حذف)
- ✅ عرض كل الإرسالات مع فلترة
- ✅ تعديل إعدادات البريد من الواجهة (دون إعادة تشغيل)
- ✅ إعدادات عامة

### 📧 إعدادات الإرسال:
- 🥇 **Resend API** (موصى به — 3000 رسالة مجانية شهرياً، بدون App Password)
- 🥈 **SMTP** احتياطي (Gmail/Outlook/Mailgun)
- 🥉 **الوضع المحلي** احتياطي (حفظ كملف نصي)

---

## 🚀 التثبيت السريع

### المتطلبات
- Node.js 18.18+ أو 20+
- npm / yarn / bun

### الخطوات

```bash
# 1. انسخ المستودع
git clone https://github.com/USERNAME/coordinator-portal.git
cd coordinator-portal

# 2. ثبّت الحزم
npm install

# 3. انسخ ملف الإعدادات
cp .env.example .env

# 4. عدّل قيم .env (مهم: JWT_SECRET, ADMIN_EMAIL, RESEND_API_KEY)
nano .env

# 5. أنشئ قاعدة البيانات
npm run db:push

# 6. شغّل خادم التطوير
npm run dev
```

افتح: `http://localhost:3000`

---

## 🌐 النشر على Vercel (الأسهل)

### الطريقة 1: زر واحد
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### ⚠️ مهم: Vercel لا يدعم SQLite!
Vercel يستخدم serverless functions بنظام ملفات للقراءة فقط، لذلك **SQLite لا يعمل**. يجب استخدام قاعدة بيانات سحابية (PostgreSQL).

#### إعداد قاعدة بيانات Neon PostgreSQL (مجانية):
1. اذهب إلى: **https://neon.tech**
2. سجّل بحساب GitHub (مجاني تماماً، بدون بطاقة ائتمان)
3. أنشئ project جديد
4. انسخ connection string (يبدأ بـ `postgresql://`)
5. استخدمه كقيمة لـ `DATABASE_URL` في Vercel

### الطريقة 2: يدوي
1. ارفع المشروع إلى GitHub
2. اذهب إلى: https://vercel.com/new
3. اختر المستودع
4. أضف متغيرات البيئة:
   - `DATABASE_URL` (Neon PostgreSQL — انظر فوق)
   - `JWT_SECRET` (32+ حرف)
   - `NEXTAUTH_URL` (رابط Vercel)
   - `ADMIN_EMAIL`
   - `RESEND_API_KEY`
   - `RESEND_FROM`
5. اضغط Deploy

---

## 🐳 النشر بـ Docker

### سريع
```bash
# 1. انسخ .env.example إلى .env وعدّله
cp .env.example .env

# 2. شغّل
docker-compose up -d

# 3. افتح http://localhost:3000
```

### يدوي
```bash
docker build -t coordinator-portal .
docker run -p 3000:3000 --env-file .env coordinator-portal
```

---

## 📧 الحصول على Resend API Key

1. اذهب إلى: https://resend.com
2. سجّل حساب (مجاني، بدون بطاقة ائتمان)
3. من لوحة التحكم → API Keys → Create API Key
4. انسخ المفتاح (يبدأ بـ `re_...`)
5. الصقه في `.env` أو في لوحة التحكم → "إعدادات البريد"

> **الخطة المجانية**: 3000 رسالة شهرياً، الإرسال لبريدك المسجل. للإرسال لأي بريد، أضف نطاقك في Resend.

---

## 🎯 كيفية الاستخدام

### للمنسق:
1. سجّل حساباً ببريدك (إذا كان = `ADMIN_EMAIL`، ستحصل على صلاحية المدير تلقائياً)
2. سجّل الدخول
3. املأ النموذج: بريد المستلم، الموضوع، النص، ارفع ملفاً
4. اضغط "إرسال الملف"

### للمدير:
1. سجّل الدخول ببريدك (`ADMIN_EMAIL`)
2. سيظهر زر **"لوحة التحكم"** في الأعلى
3. استكشف الأقسام الـ 5

---

## 📋 قائمة الدوائر (21 دائرة)

دائرة المعلوماتية · التنظيم العمراني · الأبنية · الطرق · الدراسات · الطبوغرافيا · الرقابة الداخلية · التخطيط والإحصاء · الآليات · النفايات الصلبة · مكتب الجاهزية · مكتب المدير · المخبر · الديوان العام · الموارد البشرية · القسم الفني · التنمية الإدارية · القانونية · المالية · التدريب والتأهيل · التنظيم المؤسساتي

---

## 📂 بنية المشروع

```
.
├── prisma/
│   └── schema.prisma             # Coordinator + EmailRecord + PasswordReset
├── public/
├── scripts/
│   └── generate-env.mjs          # حساب Ethereal اختباري
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # signup, login, logout, me, forgot/reset-password
│   │   │   ├── admin/             # settings, stats, coordinators, all-records
│   │   │   ├── upload/            # رفع + إرسال بريد
│   │   │   ├── history/           # جلب سجل المستخدم
│   │   │   └── download/          # تنزيل ملف
│   │   ├── auth/                  # login, signup, forgot/reset-password pages
│   │   ├── dashboard/             # لوحة التحكم (للمدير)
│   │   ├── layout.tsx             # RTL + خط Cairo + AuthProvider
│   │   └── page.tsx               # الصفحة الرئيسية
│   ├── components/
│   │   ├── admin/                 # مكونات لوحة التحكم
│   │   ├── ui/                    # shadcn/ui
│   │   ├── auth-context.tsx
│   │   ├── home-content.tsx
│   │   ├── upload-form.tsx
│   │   └── history-panel.tsx
│   └── lib/
│       ├── auth.ts                # JWT + bcrypt + DEPARTMENTS
│       ├── session.ts             # getSession
│       ├── email.ts               # Resend/SMTP/local
│       ├── resend-email.ts
│       ├── env-settings.ts        # قراءة/كتابة .env
│       ├── db.ts                  # Prisma client
│       └── utils.ts
├── .github/
│   ├── workflows/ci.yml           # GitHub Actions
│   └── ISSUE_TEMPLATE/            # قوالب Issues
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── vercel.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
└── tsconfig.json
```

---

## 🔐 الأمان

- ✅ كلمات المرور مشفّرة بـ **bcryptjs**
- ✅ الجلسات بتوقيع **JWT** (7 أيام)
- ✅ HTTP-only cookies
- ✅ كل الـ API محمية بالجلسة
- ✅ كل منسق يرى إرسالاته فقط
- ✅ لوحة التحكم للمدير فقط
- ✅ التحقق من الحقول في الخادم
- ✅ التحقق من حجم ونوع الملف

راجع [SECURITY.md](./SECURITY.md) للتفاصيل.

---

## 🛠️ التطوير

### الأوامر المتاحة
```bash
npm run dev          # خادم التطوير
npm run build        # بناء للإنتاج
npm run start        # خادم الإنتاج
npm run lint         # فحص ESLint
npm run db:push      # إنشاء/تحديث الجداول
npm run db:generate  # توليد Prisma Client
npm run db:migrate   # إنشاء migration
npm run db:reset     # إعادة تعيين قاعدة البيانات
```

### المساهمة
راجع [CONTRIBUTING.md](./CONTRIBUTING.md) للتفاصيل.

---

## 📦 النشر على GitHub

### الخطوة 1: أنشئ مستودع فارغ على GitHub
- اذهب إلى: https://github.com/new
- اسم المستودع: `coordinator-portal`
- لا تفعّل أي خيار (README, .gitignore, license)

### الخطوة 2: ارفع المشروع محلياً
```bash
# شغّل السكربت الجاهز
bash scripts/push-to-github.sh <your-github-username> coordinator-portal

# أو يدوياً:
git init
git add -A
git commit -m "feat: إطلاق بوابة المنسقين v1.1.0"
git branch -M main
git remote add origin https://github.com/<username>/coordinator-portal.git
git push -u origin main
```

### الخطوة 3: أضف متغيرات البيئة في Vercel
- اذهب إلى إعدادات المشروع في Vercel → Environment Variables
- أضف المتغيرات المطلوبة من `.env.example`

---

## 📚 التقنيات

| الفئة | التقنية |
|------|---------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | bcryptjs + jsonwebtoken |
| Email | Nodemailer + Resend |
| Icons | Lucide |
| Fonts | Cairo (Arabic) |

---

## ❓ استكشاف الأخطاء

<details>
<summary>📝 "يجب تسجيل الدخول أولاً" لكني سجّلت</summary>

- تحقق من `JWT_SECRET` في `.env`
- امسح cookies المتصفح وأعد المحاولة
- أعد تشغيل الخادم بعد تعديل `.env`
</details>

<details>
<summary>📝 "جدول قاعدة البيانات غير موجود"</summary>

```bash
npm run db:push
```
</details>

<details>
<summary>📝 البريد لا يصل</summary>

- تحقق من `RESEND_API_KEY` و `RESEND_FROM` في `.env`
- في الخطة المجانية: يمكنك الإرسال فقط لبريدك المسجل في Resend
- راجع السجلات: `tail -f dev.log`
</details>

<details>
<summary>📝 نسيت كلمة المرور</summary>

اذهب إلى `/auth/forgot-password` → أدخل بريدك → ستصلك رسالة مع رابط.
</details>

---

## 📄 الترخيص

MIT License — راجع [LICENSE](./LICENSE)

---

## 🙏 شكر خاص

- [Next.js](https://nextjs.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Prisma](https://prisma.io)
- [Resend](https://resend.com)
- [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

**صنع بـ ❤️ لدائرة المعلوماتية**

[الموقع الرئيسي](http://localhost:3000) · [التوثيق](./README.md) · [المساهمة](./CONTRIBUTING.md) · [الأمان](./SECURITY.md)

</div>
