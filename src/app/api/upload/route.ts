import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getSession } from '@/lib/session'

// حد حجم الملف: 25 ميجابايت (إجمالي قياسي لمعظم خدمات البريد)
const MAX_FILE_SIZE = 25 * 1024 * 1024

// أنواع الملفات المسموح بها
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
]

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // التحقق من تسجيل الدخول
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    const recipientEmail = formData.get('recipientEmail') as string | null
    const subject = formData.get('subject') as string | null
    const message = formData.get('message') as string | null
    const file = formData.get('file') as File | null

    // التحقق من الحقول المطلوبة
    if (!recipientEmail?.trim() || !isValidEmail(recipientEmail)) {
      return NextResponse.json(
        { error: 'الرجاء إدخال بريد إلكتروني صحيح للمستلم' },
        { status: 400 }
      )
    }
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: 'الرجاء إدخال موضوع الرسالة' },
        { status: 400 }
      )
    }
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'الرجاء إدخال نص الرسالة' },
        { status: 400 }
      )
    }
    if (!file) {
      return NextResponse.json(
        { error: 'الرجاء اختيار ملف للرفع' },
        { status: 400 }
      )
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف يتجاوز الحد المسموح به (${MAX_FILE_SIZE / 1024 / 1024} ميجابايت)` },
        { status: 400 }
      )
    }

    // التحقق من نوع الملف (السماح بأي نوع إذا لم يكن محدداً في القائمة)
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الرجاء استخدام PDF, Word, Excel, صور, أو ZIP' },
        { status: 400 }
      )
    }

    // حفظ الملف على القرص
    const uploadDir = path.join(process.cwd(), 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    const fileExt = path.extname(file.name) || ''
    const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${fileExt}`
    const filePath = path.join(uploadDir, safeFileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // إنشاء سجل في قاعدة البيانات (يرتبط بالمنسق الحالي)
    const record = await db.emailRecord.create({
      data: {
        coordinatorId: session.id,
        coordinatorName: session.name,
        coordinatorEmail: session.email,
        coordinatorDepartment: session.department,
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
        fileName: file.name,
        filePath: safeFileName, // اسم الملف فقط للاستخدام لاحقاً
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        status: 'pending',
      },
    })

    // إرسال البريد الإلكتروني
    const emailResult = await sendEmail({
      to: recipientEmail.trim(),
      subject: subject.trim(),
      text: `${message.trim()}\n\n---\nمرسل من: ${session.name} <${session.email}>\nالدائرة: ${session.department}`,
      attachments: [
        {
          filename: file.name,
          path: filePath,
          contentType: file.type || undefined,
        },
      ],
    })

    // تحديث السجل بالنتيجة
    if (emailResult.success) {
      let statusNote: string
      if (emailResult.mode === 'local') {
        statusNote = 'تم الحفظ محلياً (الإرسال الفعلي يتطلب إعداد Resend أو SMTP)'
      } else if (emailResult.mode === 'resend') {
        statusNote = 'تم الإرسال بنجاح عبر Resend API'
      } else if (emailResult.previewUrl) {
        statusNote = `تم الإرسال عبر SMTP. معاينة الرسالة: ${emailResult.previewUrl}`
      } else {
        statusNote = 'تم الإرسال بنجاح عبر SMTP'
      }
      await db.emailRecord.update({
        where: { id: record.id },
        data: {
          status: 'sent',
          errorMessage: statusNote,
        },
      })
    } else {
      await db.emailRecord.update({
        where: { id: record.id },
        data: {
          status: 'failed',
          errorMessage: emailResult.errorMessage || 'فشل غير معروف',
        },
      })
    }

    return NextResponse.json({
      success: emailResult.success,
      id: record.id,
      mode: emailResult.mode,
      previewUrl: emailResult.previewUrl,
      message: emailResult.success
        ? (emailResult.mode === 'local'
            ? 'تم حفظ البريد محلياً. لتفعيل الإرسال الفعلي، أضف RESEND_API_KEY أو إعدادات SMTP في .env'
            : emailResult.mode === 'resend'
              ? 'تم إرسال البريد الإلكتروني بنجاح عبر Resend'
              : 'تم إرسال البريد الإلكتروني بنجاح عبر SMTP')
        : 'فشل إرسال البريد الإلكتروني',
      errorMessage: emailResult.errorMessage,
    })
  } catch (error) {
    console.error('Upload error:', error)
    const rawMsg = error instanceof Error ? error.message : 'خطأ غير متوقع'

    // رسالة واضحة بالعربية للأخطاء الشائعة
    let userMsg: string
    if (rawMsg.includes('does not exist in the current database') || rawMsg.includes('no such table')) {
      userMsg = 'جدول قاعدة البيانات غير موجود. الرجاء تشغيل: npm run db:push أو bun run db:push لإنشاء الجداول المطلوبة، ثم إعادة المحاولة.'
    } else if (rawMsg.includes('connect') || rawMsg.includes('DATABASE_URL')) {
      userMsg = 'فشل الاتصال بقاعدة البيانات. تأكد من صحة إعداد DATABASE_URL في ملف .env'
    } else if (rawMsg.includes('ENOENT') || rawMsg.includes('no such file or directory')) {
      userMsg = 'ملف غير موجود على الخادم. الرجاء المحاولة مرة أخرى.'
    } else {
      userMsg = `حدث خطأ أثناء المعالجة: ${rawMsg}`
    }
    return NextResponse.json({ error: userMsg, technicalError: rawMsg }, { status: 500 })
  }
}
