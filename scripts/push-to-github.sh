#!/bin/bash
# سكربت تهيئة المستودع ورفعه على GitHub
# الاستخدام: bash scripts/push-to-github.sh <github-username> <repo-name>

set -e

# التحقق من الحجج
if [ $# -lt 2 ]; then
  echo "❌ الاستخدام: $0 <github-username> <repo-name>"
  echo ""
  echo "مثال:"
  echo "  $0 hilal-mahmoud coordinator-portal"
  exit 1
fi

USERNAME=$1
REPO_NAME=$2
REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "🚀 تجهيز المستودع للرفع على GitHub..."
echo ""
echo "  المستخدم: $USERNAME"
echo "  المستودع: $REPO_NAME"
echo "  الرابط:   $REMOTE_URL"
echo ""

# التحقق من وجود git
if ! command -v git >/dev/null 2>&1; then
  echo "❌ git غير مثبت. الرجاء تثبيته أولاً."
  exit 1
fi

# التحقق من وجود المستودع البعيد
echo "📂 إعداد المستودع المحلي..."
cd /home/z/my-project

# إعادة تهيئة git (نظيف)
if [ ! -d ".git" ]; then
  git init
else
  echo "  ✓ .git موجود"
fi

# التأكد من الفرع main
git branch -M main 2>/dev/null || true

# إعداد lfs (للملفات الكبيرة إن وجدت)
if ! git lfs version >/dev/null 2>&1; then
  echo "  ℹ️  git-lfs غير مثبت، التخطي"
fi

# إضافة جميع الملفات (مع احترام .gitignore)
echo "➕ إضافة الملفات..."
git add -A

# عرض الملفات المضافة (للمراجعة)
echo ""
echo "📋 الملفات المضافة:"
git status --short | head -30
echo ""

# عمل أول commit
echo "💾 إنشاء commit..."
git commit -m "feat: إطلاق بوابة المنسقين في دائرة المعلوماتية v1.1.0

- نظام مصادقة كامل (تسجيل، دخول، خروج، استعادة كلمة المرور)
- لوحة تحكم للأدمين (إحصائيات، إدارة منسقين، إعدادات بريد)
- رفع الملفات وإرسالها عبر Resend API
- سجل كامل لكل إرسال
- واجهة عربية بالكامل مع RTL وخط Cairo
- تصميم متجاوب
- دعم Docker و Vercel
- GitHub Actions للـ CI
" 2>&1 || echo "  ℹ️  لا توجد تغييرات جديدة"

# إضافة المستودع البعيد
echo "🌐 إضافة المستودع البعيد..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

echo ""
echo "✅ تم تجهيز المستودع بنجاح!"
echo ""
echo "🎯 الخطوات التالية:"
echo ""
echo "  1. أنشئ مستودع فارغ على GitHub:"
echo "     https://github.com/new"
echo "     اسم المستودع: $REPO_NAME"
echo "     لا تفعّل: 'Add a README', 'Add .gitignore', 'Choose a license'"
echo ""
echo "  2. ارفع المشروع:"
echo "     git push -u origin main"
echo ""
echo "  3. إذا طُلب منك اسم المستخدم وكلمة المرور:"
echo "     - اسم المستخدم: $USERNAME"
echo "     - كلمة المرور: استخدم Personal Access Token (PAT) من:"
echo "       https://github.com/settings/tokens"
echo "     - أو استخدم GitHub CLI: gh auth login"
echo ""
echo "  4. أضف متغيرات البيئة في الإعدادات:"
echo "     - Vercel: https://vercel.com/dashboard → Project → Settings → Environment Variables"
echo "     - GitHub: Settings → Secrets and variables → Actions"
echo ""
echo "     المتغيرات المطلوبة:"
echo "     - DATABASE_URL"
echo "     - JWT_SECRET"
echo "     - NEXTAUTH_URL"
echo "     - ADMIN_EMAIL"
echo "     - RESEND_API_KEY"
echo "     - RESEND_FROM"
echo ""
echo "  5. للنشر على Vercel:"
echo "     - اذهب إلى: https://vercel.com/new"
echo "     - اختر المستودع"
echo "     - سيتم النشر تلقائياً"
echo ""
echo "🎉 تم!"
