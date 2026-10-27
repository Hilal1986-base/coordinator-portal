import fs from 'fs/promises'
import path from 'path'

const ENV_FILE = path.join(process.cwd(), '.env')

export interface EnvSettings {
  RESEND_API_KEY: string
  RESEND_FROM: string
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string
  PORTAL_NAME: string
  MAX_FILE_SIZE_MB: string
  ADMIN_EMAIL: string
}

// قائمة المفاتيح القابلة للتعديل من لوحة التحكم
const EDITABLE_KEYS: (keyof EnvSettings)[] = [
  'RESEND_API_KEY',
  'RESEND_FROM',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'PORTAL_NAME',
  'MAX_FILE_SIZE_MB',
  'ADMIN_EMAIL',
]

// قراءة الإعدادات الحالية من ملف .env
export async function readEnvSettings(): Promise<EnvSettings> {
  // نقرأ من process.env أولاً (الأحدث)
  const settings: EnvSettings = {
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM: process.env.RESEND_FROM || '',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: process.env.SMTP_PORT || '',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM: process.env.SMTP_FROM || '',
    PORTAL_NAME: process.env.PORTAL_NAME || 'بوابة المنسقين في دائرة المعلوماتية',
    MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB || '25',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  }

  // محاولة قراءة من الملف (إذا كان موجوداً)
  try {
    const content = await fs.readFile(ENV_FILE, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      // إزالة علامات الاقتباس
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (EDITABLE_KEYS.includes(key as keyof EnvSettings)) {
        ;(settings as Record<string, string>)[key] = value
      }
    }
  } catch {
    // الملف غير موجود، نستخدم القيم من process.env
  }

  return settings
}

// تحديث الإعدادات في ملف .env وفي process.env
export async function writeEnvSettings(updates: Partial<EnvSettings>): Promise<void> {
  // تحديث process.env فوراً (لكي تُستخدم في الطلبات التالية دون إعادة تشغيل)
  for (const [key, value] of Object.entries(updates)) {
    if (EDITABLE_KEYS.includes(key as keyof EnvSettings)) {
      process.env[key] = value
    }
  }

  // تحديث ملف .env
  let lines: string[] = []
  try {
    const content = await fs.readFile(ENV_FILE, 'utf-8')
    lines = content.split('\n')
  } catch {
    // الملف غير موجود، ننشئه
    lines = []
  }

  // تحديث كل مفتاح في الملف
  for (const [key, newValue] of Object.entries(updates)) {
    if (!EDITABLE_KEYS.includes(key as keyof EnvSettings)) continue

    const valueStr = String(newValue)
    // إضافة علامات اقتباس إذا كانت القيمة تحتوي على مسافات أو أحرف خاصة
    const needsQuote = /[<>\s]|\(\)/.test(valueStr)
    const formattedValue = needsQuote ? `"${valueStr}"` : valueStr

    let found = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const lineKey = trimmed.slice(0, eqIndex).trim()
      if (lineKey === key) {
        lines[i] = `${key}=${formattedValue}`
        found = true
        break
      }
    }
    if (!found) {
      lines.push(`${key}=${formattedValue}`)
    }
  }

  await fs.writeFile(ENV_FILE, lines.join('\n'), 'utf-8')
}
