import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // عرض إرسالات المستخدم الحالي فقط
    const records = await db.emailRecord.findMany({
      where: { coordinatorId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ records })
  } catch (error) {
    console.error('History fetch error:', error)
    const rawMsg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    let userMsg = 'فشل تحميل السجل'
    if (rawMsg.includes('does not exist in the current database') || rawMsg.includes('no such table')) {
      userMsg = 'جدول قاعدة البيانات غير موجود. الرجاء تشغيل: npm run db:push لإنشاء الجداول المطلوبة.'
    } else if (rawMsg.includes('connect') || rawMsg.includes('DATABASE_URL')) {
      userMsg = 'فشل الاتصال بقاعدة البيانات. تأكد من إعداد DATABASE_URL في ملف .env'
    }
    return NextResponse.json(
      { error: userMsg, technicalError: rawMsg },
      { status: 500 }
    )
  }
}
