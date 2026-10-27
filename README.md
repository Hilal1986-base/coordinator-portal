# بوابة المنسقين في دائرة المعلوماتية

بوابة لرفع الملفات وإرسالها عبر البريد الإلكتروني، مع نظام مصادقة كامل ولوحة تحكم للأدمين.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## المميزات

### للمستخدمين (المنسقين):
- ✅ تسجيل حساب بالاسم + البريد + كلمة المرور + اختيار الدائرة من قائمة منسدلة
- ✅ تسجيل الدخول والخروج
- ✅ استعادة كلمة المرور عبر البريد
- ✅ رفع ملف (السحب والإفلات أو الاختيار اليدوي)
- ✅ إرسال الملف إلى أي بريد إلكتروني مع رسالة مرفقة
- ✅ سجل شخصي بالإرسالات مع إمكانية تنزيل الملفات
- ✅ كل منسق يرى إرسالاته فقط (خصوصية كاملة)

### للمدير:
- ✅ لوحة تحكم على `/dashboard`
- ✅ إحصائيات شاملة (عدد المنسقين، الإرسالات، نسبة النجاح، آخر النشاطات)
- ✅ إدارة المنسقين (عرض + حذف)
- ✅ عرض كل الإرسالات مع فلترة بالدائرة والحالة
- ✅ تعديل إعدادات البريد (Resend API Key + Sender) من الواجهة دون إعادة تشغيل
- ✅ إعدادات عامة (اسم البوابة، حجم الملف، بريد المدير)

### إعدادات الإرسال:
- ✅ **Resend API** (الموصى به — 3000 رسالة مجانية شهرياً، بدون App Password)
- ✅ **SMTP** احتياطي (Gmail/Outlook/Mailgun)
- ✅ **الوضع المحلي** احتياطي (حفظ محتوى البريد كملف نصي)

## التقنيات المستخدمة

- **Next.js 16** مع App Router
- **TypeScript** بشكل كامل
- **Tailwind CSS 4** مع shadcn/ui
- **Prisma ORM** مع SQLite (يمكن التغيير إلى PostgreSQL/MySQL)
- **Nodemailer + Resend** لإرسال البريد
- **bcryptjs** لتشفير كلمات المرور
- **jsonwebtoken** للجلسات

---

## التثبيت والتشغيل

### المتطلبات
- Node.js 18.18+ أو 20+
- npm / yarn / bun

### الخطوة 1: تثبيت الحزم

```bash
npm install
# أو
yarn install
# أو
bun install
```

### الخطوة 2: إعداد ملف `.env`

```bash
cp .env.example .env
```

ثم املأ القيم في `.env`:

```bash
# قاعدة البيانات (افتراضي: SQLite، لا يحتاج خادماً)
DATABASE_URL=file:/home/z/my-project/db/custom.db

# سر الجلسة (غيّره في الإنتاج إلى قيمة عشوائية طويلة)
JWT_SECRET=change-this-to-a-long-random-secret-in-production-32chars

# عنوان التطبيق
NEXTAUTH_URL=http://localhost:3000

# بريد المدير (له صلاحية لوحة التحكم)
ADMIN_EMAIL=admin@your-domain.com

# إعدادات Resend (الموصى به)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM="بوابة المنسقين <onboarding@resend.dev>"
```

### الخطوة 3: إعداد قاعدة البيانات

```bash
npm run db:push
```

### الخطوة 4: تشغيل التطبيق

```bash
# وضع التطوير
npm run dev

# أو وضع الإنتاج
npm run build && npm run start
```

افتح: `http://localhost:3000`

---

## الحصول على Resend API Key

1. اذهب إلى: https://resend.com
2. سجّل حساباً (مجاني، بدون بطاقة ائتمان)
3. من لوحة التحكم → API Keys → Create API Key
4. انسخ المفتاح (يبدأ بـ `re_...`)
5. الصقه في `.env` أو في لوحة التحكم → "إعدادات البريد"

> **الخطة المجانية**: 3000 رسالة شهرياً، الإرسال فقط لبريدك المسجل. للإرسال لأي بريد آخر، أضف نطاقك في Resend.

---

## كيفية الاستخدام

### للمنسق:
1. سجّل حساباً ببريدك (إذا كان بريدك = ADMIN_EMAIL، ستحصل على صلاحية المدير تلقائياً)
2. سجّل الدخول
3. املأ النموذج: بريد المستلم، الموضوع، النص، ارفع ملفاً
4. اضغط "إرسال الملف"
5. سيظهر السجل في لوحة السجل على اليسار

### للمدير:
1. سجّل الدخول ببريدك (المحدد في ADMIN_EMAIL)
2. سيظهر زر "لوحة التحكم" في الأعلى
3. اذهب إلى لوحة التحكم:
   - **الإحصائيات**: نظرة عامة على النظام
   - **إعدادات البريد**: تغيير API Key و RESEND_FROM
   - **إدارة المنسقين**: عرض وحذف المنسقين
   - **كل الإرسالات**: عرض جميع الإرسالات مع فلترة
   - **إعدادات عامة**: اسم البوابة، حجم الملف، بريد المدير

---

## الدوائر المتاحة (21 دائرة)

1. دائرة المعلوماتية
2. دائرة التنظيم العمراني
3. دائرة الأبنية
4. دائرة الطرق
5. دائرة الدراسات
6. دائرة الطبوغرافيا
7. دائرة الرقابة الداخلية
8. دائرة التخطيط والإحصاء
9. دائرة الآليات
10. دائرة النفايات الصلبة
11. مكتب الجاهزية
12. دائرة مكتب المدير
13. المخبر
14. دائرة الديوان العام
15. دائرة الموارد البشرية
16. القسم الفني
17. قسم التنمية الإدارية
18. الدائرة القانونية
19. الدائرة المالية
20. دائرة التدريب والتأهيل
21. دائرة التنظيم المؤسساتي

---

## بنية المشروع

```
.
├── prisma/
│   └── schema.prisma             # Coordinator + EmailRecord + PasswordReset
├── public/
├── scripts/
│   └── generate-env.mjs          # توليد حساب Ethereal اختباري
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # signup, login, logout, me, forgot/reset-password
│   │   │   ├── admin/             # settings, stats, coordinators, all-records
│   │   │   ├── upload/            # رفع + إرسال بريد
│   │   │   ├── history/           # جلب سجل المستخدم
│   │   │   └── download/          # تنزيل ملف
│   │   ├── auth/
│   │   │   ├── login/             # صفحة تسجيل الدخول
│   │   │   ├── signup/            # صفحة التسجيل
│   │   │   ├── forgot-password/   # طلب إعادة تعيين
│   │   │   └── reset-password/    # إعادة تعيين كلمة المرور
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
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

---

## الأمان

- ✅ كلمات المرور مشفّرة بـ bcryptjs (salt rounds: 10)
- ✅ الجلسات بتوقيع JWT (صالحة 7 أيام)
- ✅ كل الـ API محمية بالجلسة
- ✅ كل منسق يرى إرسالاته فقط
- ✅ لوحة التحكم للمدير فقط (يتحقق من دور المستخدم)
- ✅ التحقق من صحة الحقول في الخادم والعميل
- ✅ التحقق من حجم ونوع الملف
- ⚠️ في الإنتاج: استخدم HTTPS، غيّر JWT_SECRET، احذف .env من Git

---

## النشر

### على Vercel
1. ارفع المشروع إلى GitHub
2. اربطه بـ Vercel
3. أضف متغيرات البيئة في إعدادات Vercel
4. عدّل `prisma/schema.prisma` لاستخدام PostgreSQL

### على VPS مع PM2
```bash
npm install -g pm2
pm2 start npm --name "coordinator-portal" -- start
pm2 save && pm2 startup
```

### مع Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name portal.your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    client_max_body_size 30M;
}
```

---

## استكشاف الأخطاء

### "يجب تسجيل الدخول أولاً" لكني سجّلت
- تحقق من وجود `JWT_SECRET` في `.env`
- امسح cookies المتصفح وأعد المحاولة
- أعد تشغيل الخادم بعد تعديل `.env`

### "جدول قاعدة البيانات غير موجود"
```bash
npm run db:push
```

### البريد لا يصل
- تحقق من `RESEND_API_KEY` و `RESEND_FROM` في `.env`
- في الخطة المجانية، يمكنك الإرسال فقط إلى بريدك المسجل في Resend
- راجع السجلات: `tail -f dev.log` أو سجل PM2

### نسيت كلمة المرور
- اذهب إلى `/auth/forgot-password`
- أدخل بريدك، ستصلك رسالة مع رابط إعادة التعيين

---

## الترخيص
MIT License — حر للاستخدام والتعديل.
