'use client'

import { useEffect, useState } from 'react'
import { Settings, Save, Loader2, UserCog, Maximize2, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface GeneralSettingsData {
  PORTAL_NAME: string
  MAX_FILE_SIZE_MB: string
  ADMIN_EMAIL: string
}

export function GeneralSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<GeneralSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('فشل تحميل الإعدادات')
        const data = await res.json()
        setSettings({
          PORTAL_NAME: data.settings.PORTAL_NAME,
          MAX_FILE_SIZE_MB: data.settings.MAX_FILE_SIZE_MB,
          ADMIN_EMAIL: data.settings.ADMIN_EMAIL,
        })
      })
      .catch((e) => {
        toast({ title: 'فشل', description: e.message, variant: 'destructive' })
      })
      .finally(() => setLoading(false))
  }, [toast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل', description: data.error, variant: 'destructive' })
        return
      }
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث الإعدادات. قد تحتاج لإعادة تحميل الصفحة لرؤية التغييرات.',
      })
    } catch (e) {
      toast({ title: 'فشل', description: 'خطأ في الشبكة', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!settings) return <p className="text-center py-12 text-muted-foreground">لا توجد بيانات</p>

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="size-5 text-primary" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>إعدادات أساسية للبوابة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portal-name" className="flex items-center gap-1.5">
              <Settings className="size-3.5 text-muted-foreground" />
              اسم البوابة
            </Label>
            <Input
              id="portal-name"
              value={settings.PORTAL_NAME}
              onChange={(e) => setSettings({ ...settings, PORTAL_NAME: e.target.value })}
              placeholder="بوابة المنسقين في دائرة المعلوماتية"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              يظهر في عنوان الصفحة والهيدر. (قد يتطلب إعادة تحميل الصفحة)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-file-size" className="flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-muted-foreground" />
              الحد الأقصى لحجم الملف (MB)
            </Label>
            <Input
              id="max-file-size"
              type="number"
              min="1"
              max="100"
              value={settings.MAX_FILE_SIZE_MB}
              onChange={(e) => setSettings({ ...settings, MAX_FILE_SIZE_MB: e.target.value })}
              placeholder="25"
              dir="ltr"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              الحد الموصى به: 25 ميجابايت (لأن معظم مزودي البريد يحدّون المرفقات بحوالي 25MB)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCog className="size-5 text-primary" />
            إعدادات الإدارة
          </CardTitle>
          <CardDescription>تعيين بريد المدير (له صلاحية الوصول إلى لوحة التحكم)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              بريد المدير
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={settings.ADMIN_EMAIL}
              onChange={(e) => setSettings({ ...settings, ADMIN_EMAIL: e.target.value })}
              placeholder="admin@company.com"
              dir="ltr"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              المستخدم المسجل بهذا البريد سيحصل على صلاحيات المدير تلقائياً عند تسجيل الدخول.
              <br />
              <strong>تحذير:</strong> تغيير هذا البريد سيؤثر على صلاحيات الإدارة فوراً.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="size-4" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
