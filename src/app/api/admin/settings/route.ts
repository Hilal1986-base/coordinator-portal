import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { readEnvSettings, writeEnvSettings, EnvSettings } from '@/lib/env-settings'

// التحقق من أن المستخدم مدير
function requireAdmin(request: NextRequest) {
  return getSession(request).then((session) => {
    if (!session || session.role !== 'admin') return null
    return session
  })
}

// GET: جلب الإعدادات الحالية
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }
  const settings = await readEnvSettings()
  return NextResponse.json({ settings })
}

// PUT: تحديث الإعدادات
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const updates: Partial<EnvSettings> = {}

    // الحقول المسموح بتحديثها
    if (typeof body.RESEND_API_KEY === 'string') {
      updates.RESEND_API_KEY = body.RESEND_API_KEY.trim()
    }
    if (typeof body.RESEND_FROM === 'string') {
      updates.RESEND_FROM = body.RESEND_FROM.trim()
    }
    if (typeof body.SMTP_HOST === 'string') {
      updates.SMTP_HOST = body.SMTP_HOST.trim()
    }
    if (typeof body.SMTP_PORT === 'string') {
      updates.SMTP_PORT = body.SMTP_PORT.trim()
    }
    if (typeof body.SMTP_USER === 'string') {
      updates.SMTP_USER = body.SMTP_USER.trim()
    }
    if (typeof body.SMTP_PASS === 'string') {
      updates.SMTP_PASS = body.SMTP_PASS.trim()
    }
    if (typeof body.SMTP_FROM === 'string') {
      updates.SMTP_FROM = body.SMTP_FROM.trim()
    }
    if (typeof body.PORTAL_NAME === 'string') {
      updates.PORTAL_NAME = body.PORTAL_NAME.trim()
    }
    if (typeof body.MAX_FILE_SIZE_MB === 'string') {
      const mb = parseInt(body.MAX_FILE_SIZE_MB, 10)
      if (!isNaN(mb) && mb > 0 && mb <= 100) {
        updates.MAX_FILE_SIZE_MB = body.MAX_FILE_SIZE_MB.trim()
      } else {
        return NextResponse.json(
          { error: 'حجم الملف يجب أن يكون رقم بين 1 و 100' },
          { status: 400 }
        )
      }
    }
    if (typeof body.ADMIN_EMAIL === 'string') {
      const email = body.ADMIN_EMAIL.trim()
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'بريد المدير غير صحيح' },
          { status: 400 }
        )
      }
      updates.ADMIN_EMAIL = email
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'لا توجد تحديثات' }, { status: 400 })
    }

    await writeEnvSettings(updates)
    const newSettings = await readEnvSettings()
    return NextResponse.json({
      success: true,
      settings: newSettings,
      message: 'تم تحديث الإعدادات بنجاح',
    })
  } catch (error) {
    console.error('Settings update error:', error)
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    return NextResponse.json({ error: `فشل التحديث: ${msg}` }, { status: 500 })
  }
}
