import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  createSessionToken,
  sessionCookieConfig,
  DEPARTMENTS,
  determineRole,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, department } = body

    // التحقق من الحقول
    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: 'الرجاء إدخال اسم صحيح' }, { status: 400 })
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'الرجاء إدخال بريد إلكتروني صحيح' }, { status: 400 })
    }
    if (!password || !isValidPassword(password)) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }
    if (!department?.trim() || !DEPARTMENTS.includes(department)) {
      return NextResponse.json({ error: 'الرجاء اختيار دائرة من القائمة' }, { status: 400 })
    }

    // التحقق من عدم وجود حساب سابق
    const existing = await db.coordinator.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل مسبقاً. سجل الدخول بدلاً من ذلك.' },
        { status: 409 }
      )
    }

    // إنشاء الحساب
    const passwordHash = await hashPassword(password)
    const role = determineRole(email)
    const coordinator = await db.coordinator.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        department: department.trim(),
        role,
      },
    })

    // إنشاء الجلسة
    const token = createSessionToken({
      id: coordinator.id,
      email: coordinator.email,
      name: coordinator.name,
      department: coordinator.department,
      role: coordinator.role,
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
    console.error('Signup error:', error)
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    return NextResponse.json({ error: `فشل التسجيل: ${msg}` }, { status: 500 })
  }
}
