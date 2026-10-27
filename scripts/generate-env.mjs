// توليد حساب Ethereal Email اختباري وكتابته إلى ملف .env
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

async function main() {
  console.log('جاري إنشاء حساب Ethereal Email اختباري...')
  const account = await nodemailer.createTestAccount()
  console.log('تم إنشاء الحساب بنجاح')

  const envContent = [
    '# ====== إعدادات قاعدة البيانات ======',
    `DATABASE_URL=file:${path.join(process.cwd(), 'db', 'custom.db')}`,
    '',
    '# ====== إعدادات SMTP (Ethereal Email - للتجربة فقط) ======',
    '# هذا حساب اختباري يلتقط الرسائل دون إرسالها فعلياً.',
    '# لمعاينة الرسائل المرسلة، استخدم رابط previewUrl الذي يظهر في السجل.',
    '# للإنتاج، استبدل هذه القيم بإعدادات مزودك الحقيقي (Gmail/Outlook/Mailgun...).',
    `SMTP_HOST=smtp.ethereal.email`,
    `SMTP_PORT=587`,
    `SMTP_USER=${account.user}`,
    `SMTP_PASS=${account.pass}`,
    `SMTP_FROM="بوابة المنسقين <${account.user}>"`,
    '',
    '# ====== ملاحظات للإنتاج ======',
    '# Gmail: استخدم App Password من إعدادات الأمان (وليس كلمة المرور العادية)',
    '#   SMTP_HOST=smtp.gmail.com',
    '#   SMTP_PORT=587',
    '# Outlook: SMTP_HOST=smtp-mail.outlook.com, SMTP_PORT=587',
    '# Mailgun: SMTP_HOST=smtp.mailgun.org, SMTP_PORT=587',
  ].join('\n')

  const envPath = path.join(process.cwd(), '.env')
  await fs.writeFile(envPath, envContent, 'utf-8')
  console.log(`تم كتابة ملف .env إلى: ${envPath}`)
  console.log('بيانات الحساب:')
  console.log(`  المستخدم: ${account.user}`)
  console.log(`  كلمة المرور: ${account.pass}`)
}

main().catch((err) => {
  console.error('فشل إنشاء الحساب:', err.message)
  process.exit(1)
})
