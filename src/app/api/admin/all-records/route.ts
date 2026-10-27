import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (department && department !== 'all') {
      where.coordinatorDepartment = department
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const records = await db.emailRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        coordinatorName: true,
        coordinatorEmail: true,
        coordinatorDepartment: true,
        recipientEmail: true,
        subject: true,
        fileName: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('All records fetch error:', error)
    return NextResponse.json({ error: 'فشل تحميل السجلات' }, { status: 500 })
  }
}
