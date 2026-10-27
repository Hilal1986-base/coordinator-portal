import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, isValidPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token) {
      return NextResponse.json({ error: 'الرمز غير صالح' }, { status: 400 })
    }
    if (!password || !isValidPassword(password)) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // البحث عن الرمز
    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
    })

    if (!resetRecord) {
      return NextResponse.json({ error: 'الرمز غير صالح' }, { status: 400 })
    }

    // التحقق من الصلاحية والاستخدام
    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'تم استخدام هذا الرمز مسبقاً' },
        { status: 400 }
      )
    }
    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'انتهت صلاحية الرمز. طلب رابط إعادة تعيين جديد.' },
        { status: 400 }
      )
    }

    // تحديث كلمة المرور
    const passwordHash = await hashPassword(password)
    await db.$transaction([
      db.coordinator.update({
        where: { id: resetRecord.coordinatorId },
        data: { passwordHash },
      }),
      db.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    return NextResponse.json({ error: `فشل إعادة التعيين: ${msg}` }, { status: 500 })
  }
}
