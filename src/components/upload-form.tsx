'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, Loader2, Send, Mail, AtSign, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-context'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`
  return `${(bytes / 1024 / 1024).toFixed(2)} ميجابايت`
}

export function UploadForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { coordinator } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFileSelect = useCallback((selected: File | null) => {
    if (!selected) return
    if (selected.size > MAX_FILE_SIZE) {
      toast({
        title: 'حجم الملف كبير جداً',
        description: `الحد الأقصى هو ${MAX_FILE_SIZE / 1024 / 1024} ميجابايت`,
        variant: 'destructive',
      })
      return
    }
    setFile(selected)
  }, [toast])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    handleFileSelect(droppedFile)
  }, [handleFileSelect])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coordinator) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' })
      return
    }

    // التحقق من الحقول
    if (!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      toast({ title: 'الرجاء إدخال بريد إلكتروني صحيح للمستلم', variant: 'destructive' })
      return
    }
    if (!subject.trim()) {
      toast({ title: 'الرجاء إدخال موضوع الرسالة', variant: 'destructive' })
      return
    }
    if (!message.trim()) {
      toast({ title: 'الرجاء إدخال نص الرسالة', variant: 'destructive' })
      return
    }
    if (!file) {
      toast({ title: 'الرجاء اختيار ملف للرفع', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('recipientEmail', recipientEmail.trim())
      formData.append('subject', subject.trim())
      formData.append('message', message.trim())
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'فشل الإرسال',
          description: data.error || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        })
        return
      }

      if (data.mode === 'local') {
        toast({
          title: 'تم الحفظ محلياً بنجاح',
          description: 'لتفعيل الإرسال الفعلي للبريد، أضف RESEND_API_KEY أو إعدادات SMTP في ملف .env',
        })
      } else if (data.previewUrl) {
        toast({
          title: 'تم الإرسال بنجاح',
          description: (
            <span>
              تم إرسال البريد.{' '}
              <a
                href={data.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                معاينة الرسالة هنا
              </a>
            </span>
          ),
        })
      } else {
        toast({
          title: 'تم الإرسال بنجاح',
          description: data.message || 'تم إرسال البريد الإلكتروني بنجاح',
        })
      }

      // إعادة تعيين النموذج
      setRecipientEmail('')
      setSubject('')
      setMessage('')
      setFile(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'فشل الإرسال',
        description: 'حدث خطأ في الشبكة، الرجاء المحاولة لاحقاً',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Send className="size-5 text-primary" />
          إرسال ملف عبر البريد الإلكتروني
        </CardTitle>
        <CardDescription>
          قم بتعبئة البيانات التالية ورفع الملف، وسيتم إرساله إلى البريد المحدد.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* بطاقة معلومات المنسق (تأتي تلقائياً) */}
        {coordinator && (
          <div className="mb-5 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-2">مرسِل البيان:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{coordinator.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground" dir="ltr">
                {coordinator.email}
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <span className="text-muted-foreground">الدائرة:</span>
                <span className="font-medium">{coordinator.department}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* معلومات المستلم */}
          <div className="space-y-2">
            <Label htmlFor="recipientEmail" className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-primary" />
              البريد الإلكتروني للمستلم
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              disabled={submitting}
              required
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              سيتم إرسال الملف إلى هذا البريد الإلكتروني مع نص الرسالة.
            </p>
          </div>

          {/* الموضوع */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              موضوع الرسالة
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: تقرير شهر أكتوبر"
              disabled={submitting}
              required
            />
          </div>

          {/* نص الرسالة */}
          <div className="space-y-2">
            <Label htmlFor="message">نص الرسالة</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب نص الرسالة هنا..."
              disabled={submitting}
              required
              rows={4}
            />
          </div>

          {/* رفع الملف */}
          <div className="space-y-2">
            <Label>الملف المرفق</Label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              disabled={submitting}
            />
            {!file ? (
              <div
                onClick={() => !submitting && fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                  'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40',
                  submitting && 'cursor-not-allowed opacity-60'
                )}
              >
                <Upload className="size-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  اسحب الملف هنا أو انقر للاختيار
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  الحد الأقصى للحجم: {MAX_FILE_SIZE / 1024 / 1024} ميجابايت
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  الأنواع المدعومة: PDF, Word, Excel, صور, ZIP
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {file.type || 'نوع غير معروف'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={submitting}
                  aria-label="إزالة الملف"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* زر الإرسال */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="size-4" />
                إرسال الملف
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
