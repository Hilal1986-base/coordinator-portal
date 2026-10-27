import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  comparePassword,
  isValidEmail,
  createSessionToken,
  sessionCookieConfig,
  determineRole,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'الرجاء إدخال بريد إلكتروني صحيح' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: 'الرجاء إدخال كلمة المرور' }, { status: 400 })
    }

    const coordinator = await db.coordinator.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (!coordinator) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    const valid = await comparePassword(password, coordinator.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // تحديث الدور ديناميكياً (في حال تغير ADMIN_EMAIL)
    const currentRole = determineRole(coordinator.email)
    if (currentRole !== coordinator.role) {
      await db.coordinator.update({
        where: { id: coordinator.id },
        data: { role: currentRole },
      })
    }

    const token = createSessionToken({
      id: coordinator.id,
      email: coordinator.email,
      name: coordinator.name,
      department: coordinator.department,
      role: currentRole,
    })

    const response = NextResponse.json({
      success: true,
      coordinator: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        department: coordinator.department,
      },
    })
    response.cookies.set(sessionCookieConfig.name, token, sessionCookieConfig)
    return response
  } catch (error) {
    console.error('Login error:', error)
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    return NextResponse.json({ error: `فشل تسجيل الدخول: ${msg}` }, { status: 500 })
  }
}
