'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Mail, FileText, Clock, LogOut, User, Building2, LayoutDashboard, Loader2 } from 'lucide-react'
import { UploadForm } from '@/components/upload-form'
import { HistoryPanel } from '@/components/history-panel'
import { useAuth } from '@/components/auth-context'
import { Button } from '@/components/ui/button'

export function HomeContent() {
  const router = useRouter()
  const { coordinator, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !coordinator) {
      router.replace('/auth/login')
    }
  }, [loading, coordinator, router])

  if (loading || !coordinator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      {/* رأس الصفحة */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Mail className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">بوابة المنسقين</h1>
                <p className="text-xs text-muted-foreground">
                  دائرة المعلوماتية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {coordinator.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="gap-2"
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden sm:inline">لوحة التحكم</span>
                </Button>
              )}
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-medium">{coordinator.name}</span>
                <span className="text-muted-foreground">{coordinator.department}</span>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<FileText className="size-4" />}
            label="رفع سهل"
            value="السحب والإفلات"
          />
          <StatCard
            icon={<Mail className="size-4" />}
            label="إرسال آمن"
            value="مع المرفقات"
          />
          <StatCard
            icon={<Shield className="size-4" />}
            label="حماية البيانات"
            value="مشفّر"
          />
          <StatCard
            icon={<Clock className="size-4" />}
            label="حفظ السجل"
            value="تتبع كامل"
          />
        </div>

        {/* وصف البوابة */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            بوابة المنسقين في دائرة المعلوماتية
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            استخدم هذه البوابة لرفع ملف من جهازك وإرساله إلى بريد إلكتروني محدد مع رسالة مخصصة. يتم حفظ كل الإرسالات في سجل دقيق للرجوع إليها لاحقاً.
          </p>
        </div>

        {/* المحتوى: نموذج + سجل */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UploadForm />
          </div>
          <div className="lg:col-span-2">
            <HistoryPanel />
          </div>
        </div>
      </main>

      {/* تذييل */}
      <footer className="border-t mt-auto bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            بوابة المنسقين في دائرة المعلوماتية © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
