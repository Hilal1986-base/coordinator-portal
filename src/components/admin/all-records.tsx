'use client'

import { useEffect, useState } from 'react'
import { Inbox, Loader2, Filter, RefreshCw, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DEPARTMENTS } from '@/lib/auth'

interface Record {
  id: string
  coordinatorName: string
  coordinatorEmail: string
  coordinatorDepartment: string
  recipientEmail: string
  subject: string
  fileName: string
  fileSize: number
  status: string
  errorMessage: string | null
  createdAt: string
}

export function AllRecords() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchRecords = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDepartment !== 'all') params.set('department', filterDepartment)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    try {
      const res = await fetch(`/api/admin/all-records?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('فشل تحميل السجلات')
      const data = await res.json()
      setRecords(data.records)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filterDepartment, filterStatus])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <div className="flex items-center gap-2">
            <Inbox className="size-5 text-primary" />
            جميع الإرسالات
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading} className="gap-2">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* الفلاتر */}
        <div className="mb-4 flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Filter className="size-3" />
              الدائرة
            </Label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="كل الدوائر" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">كل الدوائر</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الحالة</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="sent">ناجحة</SelectItem>
                <SelectItem value="failed">فاشلة</SelectItem>
                <SelectItem value="pending">قيد المعالجة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            لا توجد سجلات مطابقة
          </p>
        ) : (
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="rounded-lg border bg-card p-3 text-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="truncate font-medium flex-1">{r.subject}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">{r.coordinatorName}</span>
                      {' · '}
                      {r.coordinatorDepartment}
                    </p>
                    <p dir="ltr">إلى: {r.recipientEmail}</p>
                    <p className="flex items-center gap-1">
                      <FileText className="size-3" />
                      <span className="truncate">{r.fileName}</span>
                      <span>·</span>
                      <span>{formatFileSize(r.fileSize)}</span>
                    </p>
                    <p>{formatDate(r.createdAt)}</p>
                    {r.errorMessage && (
                      <p className="mt-1 text-destructive text-xs line-clamp-2">{r.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'sent') return <Badge variant="default" className="bg-primary">ناجح</Badge>
  if (status === 'failed') return <Badge variant="destructive">فشل</Badge>
  return <Badge variant="secondary">قيد المعالجة</Badge>
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}>{children}</label>
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
