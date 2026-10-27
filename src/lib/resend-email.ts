import { Resend } from 'resend'
import fs from 'fs/promises'

// إعدادات Resend من متغيرات البيئة
// RESEND_API_KEY = مفتاح API من https://resend.com
// RESEND_FROM = عنوان المرسل (مثل: "بوابة المنسقين <onboarding@resend.dev>")

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

// إرسال البريد عبر Resend
export async function sendEmailViaResend(options: EmailOptions): Promise<EmailResult> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // قراءة الملفات المرفقة كم buffer
    const attachments = await Promise.all(
      options.attachments.map(async (att) => {
        const fileBuffer = await fs.readFile(att.path)
        return {
          filename: att.filename,
          content: fileBuffer,
          contentType: att.contentType,
        }
      })
    )

    const fromAddress = process.env.RESEND_FROM!
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      attachments,
    })

    if (error) {
      return {
        success: false,
        errorMessage: error.message,
        mode: 'resend',
      }
    }

    return {
      success: true,
      messageId: data?.id,
      mode: 'resend',
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, errorMessage: msg, mode: 'resend' }
  }
}
