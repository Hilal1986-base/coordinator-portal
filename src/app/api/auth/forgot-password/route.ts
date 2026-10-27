import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateResetToken, isValidEmail } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'الرجاء إدخال بريد إلكتروني صحيح' },
        { status: 400 }
      )
    }

    // للأمان: لا نكشف ما إذا كان البريد موجوداً أم لا
    // دائماً نرجع رسالة نجاح حتى لو لم يكن موجوداً
    const coordinator = await db.coordinator.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!coordinator) {
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد موجوداً، ستصل رسالة إعادة التعيين خلال لحظات',
      })
    }

    // إنشاء رمز إعادة التعيين (صالح لمدة ساعة)
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await db.passwordReset.create({
      data: {
        token,
        expiresAt,
        coordinatorId: coordinator.id,
      },
    })

    // إرسال البريد
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
    const appUrl = baseUrl || 'http://localhost:3000'
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`

    const emailResult = await sendEmail({
      to: coordinator.email,
      subject: 'إعادة تعيين كلمة المرور - بوابة المنسقين',
      text: `مرحباً ${coordinator.name}،

طلبنا منك إعادة تعيين كلمة المرور لحسابك في بوابة المنسقين في دائرة المعلوماتية.

اضغط على الرابط التالي لإعادة تعيين كلمة المرور:
${resetLink}

هذا الرابط صالح لمدة ساعة واحدة فقط.

إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.

---
بوابة المنسقين في دائرة المعلوماتية`,
      attachments: [],
    })

    if (!emailResult.success) {
      console.error('Reset email failed:', emailResult.errorMessage)
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد موجوداً، ستصل رسالة إعادة التعيين خلال لحظات',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد موجوداً، ستصل رسالة إعادة التعيين خلال لحظات',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    return NextResponse.json({ error: `فشل الطلب: ${msg}` }, { status: 500 })
  }
}
