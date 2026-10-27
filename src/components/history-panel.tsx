'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Download, Inbox, CheckCircle2, XCircle, Clock, FileText, ExternalLink, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

interface EmailRecord {
  id: string
  coordinatorName: string
  coordinatorEmail: string
  coordinatorDepartment: string
  recipientEmail: string
  subject: string
  message: string
  fileName: string
  fileSize: number
  fileType: string
  status: string
  errorMessage: string | null
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`
  return `${(bytes / 1024 / 1024).toFixed(2)} ميجابايت`
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

function StatusBadge({ status }: { status: string }) {
  if (status === 'sent') {
    return (
      <Badge variant="default" className="gap-1 bg-primary">
        <CheckCircle2 className="size-3" />
        تم الإرسال
      </Badge>
    )
  }
  if (status === 'failed') {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" />
        فشل
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="size-3" />
      قيد المعالجة
    </Badge>
  )
}

// عرض ملاحظة الحالة مع تحويل الروابط إلى روابط قابلة للنقر
function StatusNote({ text, status }: { text: string; status: string }) {
  // استخراج أي رابط URL من النص
  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  const url = urlMatch?.[0]
  const isError = status === 'failed'
  const color = isError ? 'text-destructive' : 'text-muted-foreground'

  if (!url) {
    return (
      <p className={`mt-2 text-xs ${color} line-clamp-3`}>
        {text}
      </p>
    )
  }
  const beforeUrl = text.slice(0, text.indexOf(url))
  const afterUrl = text.slice(text.indexOf(url) + url.length)
  return (
    <p className={`mt-2 text-xs ${color} line-clamp-3`}>
      {beforeUrl}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 align-middle"
      >
        {url.length > 40 ? url.slice(0, 37) + '...' : url}
        <ExternalLink className="size-3" />
      </a>
      {afterUrl}
    </p>
  )
}

export function HistoryPanel() {
  const { toast } = useToast()
  const [records, setRecords] = useState<EmailRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/history', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('فشل تحميل السجل')
      }
      const data = await res.json()
      setRecords(data.records)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'خطأ غير متوقع'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await fetch(`/api/download?id=${encodeURIComponent(id)}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'فشل التنزيل')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: 'تم تنزيل الملف', description: fileName })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'خطأ غير متوقع'
      toast({ title: 'فشل التنزيل', description: msg, variant: 'destructive' })
    }
  }

  return (
    <Card className="shadow-md flex flex-col h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Inbox className="size-5 text-primary" />
            سجل الإرسالات
          </CardTitle>
          <CardDescription>
            آخر {records.length} عملية إرسال
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchRecords}
          disabled={loading}
          aria-label="تحديث"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-[420px] pr-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin" />
              <p className="mt-2 text-sm">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <XCircle className="size-8" />
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="size-8" />
              <p className="mt-2 text-sm">لا توجد إرسالات بعد</p>
              <p className="mt-1 text-xs">ابدأ بإرسال أول ملف</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm" title={r.subject}>
                        {r.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                        إلى: {r.recipientEmail}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/40 p-2">
                    <FileText className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium" title={r.fileName}>
                        {r.fileName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(r.fileSize)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleDownload(r.id, r.fileName)}
                    >
                      <Download className="size-3" />
                      تنزيل
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.coordinatorName}</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3" />
                      <span>{r.coordinatorDepartment}</span>
                    </div>
                  </div>

                  {r.errorMessage && (
                    <StatusNote text={r.errorMessage} status={r.status} />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
