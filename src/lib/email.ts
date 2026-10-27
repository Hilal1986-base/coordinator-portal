import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

// دعم 3 أوضاع للإرسال (بترتيب الأولوية):
// 1. Resend API (إذا تم ضبط RESEND_API_KEY) — الأسهل، 3000 رسالة مجانية شهرياً
// 2. SMTP (إذا تم ضبط SMTP_HOST/PORT/USER/PASS) — Gmail/Outlook/Mailgun...
// 3. الوضع المحلي (وضع احتياطي) — حفظ محتوى البريد كملف نصي

export interface EmailOptions {
  to: string
  subject: string
  text: string
  attachments: {
    filename: string
    path: string
    contentType?: string
  }[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  previewUrl?: string
  errorMessage?: string
  mode: 'smtp' | 'local' | 'resend'
}

// التحقق من توفر إعدادات Resend
export function isResendConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM)
}

// التحقق من توفر إعدادات SMTP
export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )
}

// إنشاء ناقل البريد SMTP
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })
}

// إرسال البريد الإلكتروني (يختار الوضع المناسب تلقائياً)
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // 1. Resend API (الأولوية الأولى)
  if (isResendConfigured()) {
    const { sendEmailViaResend } = await import('./resend-email')
    return sendEmailViaResend(options)
  }

  // 2. SMTP (Gmail/Outlook/Mailgun...)
  if (isSmtpConfigured()) {
    try {
      const transport = createTransport()
      const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER
      const info = await transport.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        attachments: options.attachments,
      })
      const previewUrl = nodemailer.getTestMessageUrl(info) as string | false
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
        mode: 'smtp',
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      return { success: false, errorMessage: msg, mode: 'smtp' }
    }
  }

  // 3. الوضع المحلي (احتياطي)
  try {
    const mailDir = path.join(process.cwd(), 'uploads', 'emails')
    await fs.mkdir(mailDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const fileContent = [
      '====== محتوى البريد الإلكتروني (وضع محلي - لم يُرسل فعلياً) ======',
      `التاريخ: ${new Date().toLocaleString('ar')}`,
      `إلى: ${options.to}`,
      `الموضوع: ${options.subject}`,
      `المرفقات: ${options.attachments.map((a) => a.filename).join(', ') || 'لا يوجد'}`,
      '',
      '------ نص الرسالة ------',
      options.text,
      '',
      '====== لتفعيل الإرسال الفعلي، قم بضبط أحد الخيارين: ======',
      '1) Resend API: RESEND_API_KEY + RESEND_FROM  (الأسهل — احصل عليه من https://resend.com)',
      '2) SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM  (Gmail/Outlook/Mailgun...)',
    ].join('\n')
    const mailFile = path.join(mailDir, `email-${ts}.txt`)
    await fs.writeFile(mailFile, fileContent, 'utf-8')
    return {
      success: true,
      messageId: `local-${ts}`,
      errorMessage: undefined,
      mode: 'local',
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, errorMessage: msg, mode: 'local' }
  }
}
