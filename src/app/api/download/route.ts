import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'معرف مفقود' }, { status: 400 })
    }

    const record = await db.emailRecord.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    // التحقق من أن المستخدم يملك هذا السجل
    if (record.coordinatorId !== session.id) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى هذا الملف' }, { status: 403 })
    }

    const filePath = path.join(process.cwd(), 'uploads', record.filePath)
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'الملف غير موجود على الخادم' }, { status: 404 })
    }

    const buffer = await fs.readFile(filePath)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': record.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(record.fileName)}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    const rawMsg = error instanceof Error ? error.message : 'خطأ غير متوقع'
    let userMsg = 'فشل التنزيل'
    if (rawMsg.includes('does not exist in the current database') || rawMsg.includes('no such table')) {
      userMsg = 'جدول قاعدة البيانات غير موجود. الرجاء تشغيل: npm run db:push لإنشاء الجداول المطلوبة.'
    }
    return NextResponse.json({ error: userMsg, technicalError: rawMsg }, { status: 500 })
  }
}
