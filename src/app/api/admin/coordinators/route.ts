import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const coordinators = await db.coordinator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        createdAt: true,
        _count: {
          select: { emailRecords: true },
        },
      },
    })

    return NextResponse.json({
      coordinators: coordinators.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        department: c.department,
        role: c.role,
        createdAt: c.createdAt,
        emailCount: c._count.emailRecords,
      })),
    })
  } catch (error) {
    console.error('Coordinators fetch error:', error)
    return NextResponse.json({ error: 'فشل تحميل المنسقين' }, { status: 500 })
  }
}

// حذف منسق
export async function DELETE(request: NextRequest) {
  const session = await getSession(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'معرف مفقود' }, { status: 400 })
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك' }, { status: 400 })
    }

    // حذف سجلات البريد المرتبطة أولاً
    await db.emailRecord.deleteMany({ where: { coordinatorId: id } })
    await db.passwordReset.deleteMany({ where: { coordinatorId: id } })
    await db.coordinator.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'تم حذف المنسق' })
  } catch (error) {
    console.error('Coordinator delete error:', error)
    return NextResponse.json({ error: 'فشل الحذف' }, { status: 500 })
  }
}
