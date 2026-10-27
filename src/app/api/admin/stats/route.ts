import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const [
      totalCoordinators,
      totalEmails,
      sentEmails,
      failedEmails,
      pendingEmails,
      recentEmails,
    ] = await Promise.all([
      db.coordinator.count(),
      db.emailRecord.count(),
      db.emailRecord.count({ where: { status: 'sent' } }),
      db.emailRecord.count({ where: { status: 'failed' } }),
      db.emailRecord.count({ where: { status: 'pending' } }),
      db.emailRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          coordinatorName: true,
          coordinatorDepartment: true,
          recipientEmail: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    // تجميع الإرسالات حسب الدائرة (بدلاً من groupBy لتوافق SQLite)
    const allRecords = await db.emailRecord.findMany({
      select: { coordinatorDepartment: true },
    })
    const departmentCountMap: Record<string, number> = {}
    for (const r of allRecords) {
      const dep = r.coordinatorDepartment
      departmentCountMap[dep] = (departmentCountMap[dep] || 0) + 1
    }
    const emailsByDepartment = Object.entries(departmentCountMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const successRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0

    return NextResponse.json({
      stats: {
        totalCoordinators,
        totalEmails,
        sentEmails,
        failedEmails,
        pendingEmails,
        successRate,
        recentEmails,
        emailsByDepartment,
      },
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'فشل تحميل الإحصائيات' }, { status: 500 })
  }
}
