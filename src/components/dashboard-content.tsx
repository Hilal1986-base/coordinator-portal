'use client'

import { useRouter } from 'next/navigation'
import { Loader2, LayoutDashboard, Mail, Users, Inbox, Settings as SettingsIcon, BarChart3, LogOut, User } from 'lucide-react'
import { useAuth } from '@/components/auth-context'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/admin/stats-cards'
import { EmailSettings } from '@/components/admin/email-settings'
import { CoordinatorsManager } from '@/components/admin/coordinators-manager'
import { GeneralSettings } from '@/components/admin/general-settings'
import { AllRecords } from '@/components/admin/all-records'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type Tab = 'stats' | 'email-settings' | 'coordinators' | 'all-records' | 'general-settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'stats', label: 'الإحصائيات', icon: <BarChart3 className="size-4" /> },
  { id: 'email-settings', label: 'إعدادات البريد', icon: <Mail className="size-4" /> },
  { id: 'coordinators', label: 'إدارة المنسقين', icon: <Users className="size-4" /> },
  { id: 'all-records', label: 'كل الإرسالات', icon: <Inbox className="size-4" /> },
  { id: 'general-settings', label: 'إعدادات عامة', icon: <SettingsIcon className="size-4" /> },
]

export function DashboardContent() {
  const router = useRouter()
  const { coordinator, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('stats')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!coordinator || coordinator.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">غير مصرح لك بالوصول إلى لوحة التحكم</p>
          <Button className="mt-4" onClick={() => router.replace('/')}>
            العودة للصفحة الرئيسية
          </Button>
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
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* الرأس */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <LayoutDashboard className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">لوحة التحكم</h1>
                <p className="text-xs text-muted-foreground">بوابة المنسقين في دائرة المعلوماتية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">العودة للبوابة</span>
              </Button>
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

      {/* المحتوى */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        {/* تبويبات */}
        <div className="mb-6 flex flex-wrap gap-1 border-b pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* المحتوى حسب التبويب */}
        <div className="mt-4">
          {activeTab === 'stats' && <StatsCards />}
          {activeTab === 'email-settings' && <EmailSettings />}
          {activeTab === 'coordinators' && <CoordinatorsManager />}
          {activeTab === 'all-records' && <AllRecords />}
          {activeTab === 'general-settings' && <GeneralSettings />}
        </div>
      </main>

      {/* تذييل */}
      <footer className="border-t mt-auto bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground">
          لوحة تحكم بوابة المنسقين © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
