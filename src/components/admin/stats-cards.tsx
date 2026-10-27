'use client'

import { useEffect, useState } from 'react'
import { Users, Mail, CheckCircle2, XCircle, TrendingUp, Clock, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Stats {
  totalCoordinators: number
  totalEmails: number
  sentEmails: number
  failedEmails: number
  pendingEmails: number
  successRate: number
  recentEmails: Array<{
    id: string
    coordinatorName: string
    coordinatorDepartment: string
    recipientEmail: string
    subject: string
    status: string
    createdAt: string
  }>
  emailsByDepartment: Array<{ department: string; count: number }>
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('فشل تحميل الإحصائيات')
        const data = await res.json()
        setStats(data.stats)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }
  if (error || !stats) {
    return (
      <div className="text-center py-12 text-destructive">
        <XCircle className="size-8 mx-auto" />
        <p className="mt-2">{error || 'فشل تحميل البيانات'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Users className="size-4" />}
          label="المنسقون"
          value={stats.totalCoordinators}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />
        <StatCard
          icon={<Mail className="size-4" />}
          label="كل الإرسالات"
          value={stats.totalEmails}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="ناجحة"
          value={stats.sentEmails}
          color="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
        />
        <StatCard
          icon={<XCircle className="size-4" />}
          label="فاشلة"
          value={stats.failedEmails}
          color="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="قيد المعالجة"
          value={stats.pendingEmails}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="نسبة النجاح"
          value={`${stats.successRate}%`}
          color="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
        />
      </div>

      {/* آخر الإرسالات */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              آخر الإرسالات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد إرسالات بعد</p>
            ) : (
              <ScrollArea className="h-72 pr-3">
                <div className="space-y-2">
                  {stats.recentEmails.map((email) => (
                    <div key={email.id} className="rounded-lg border bg-card p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{email.subject}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {email.coordinatorName} · {email.coordinatorDepartment}
                          </p>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            إلى: {email.recipientEmail}
                          </p>
                        </div>
                        <StatusBadge status={email.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* الإرسالات حسب الدائرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              الإرسالات حسب الدائرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.emailsByDepartment.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p>
            ) : (
              <ScrollArea className="h-72 pr-3">
                <div className="space-y-2">
                  {stats.emailsByDepartment.map((item, i) => {
                    const maxCount = stats.emailsByDepartment[0]?.count || 1
                    const percentage = Math.round((item.count / maxCount) * 100)
                    return (
                      <div key={item.department} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium">{item.department}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className={`flex size-9 items-center justify-center rounded-lg ${color} mb-2`}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'sent') return <Badge variant="default" className="bg-primary">ناجح</Badge>
  if (status === 'failed') return <Badge variant="destructive">فشل</Badge>
  return <Badge variant="secondary">قيد المعالجة</Badge>
}
