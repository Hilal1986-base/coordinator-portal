'use client'

import { useEffect, useState } from 'react'
import { Mail, Save, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface EmailSettingsData {
  RESEND_API_KEY: string
  RESEND_FROM: string
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string
}

export function EmailSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<EmailSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('فشل تحميل الإعدادات')
        const data = await res.json()
        setSettings(data.settings)
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
      setSettings(data.settings)
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث إعدادات البريد بنجاح',
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
  if (!settings) {
    return <p className="text-center py-12 text-muted-foreground">لا توجد بيانات</p>
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Resend Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="size-5 text-primary" />
            إعدادات Resend API (الموصى به)
          </CardTitle>
          <CardDescription>
            الحصول على مفتاح API من https://resend.com — 3000 رسالة مجانية شهرياً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend-api-key" className="flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-muted-foreground" />
              مفتاح Resend API
            </Label>
            <div className="flex gap-2">
              <Input
                id="resend-api-key"
                type={showApiKey ? 'text' : 'password'}
                value={settings.RESEND_API_KEY}
                onChange={(e) => setSettings({ ...settings, RESEND_API_KEY: e.target.value })}
                placeholder="re_xxxxxxxxxxxx"
                dir="ltr"
                disabled={saving}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? 'إخفاء' : 'إظهار'}
              >
                {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              سجّل في Resend، أنشئ API Key، والصقه هنا. ابدأ بـ <code className="font-mono text-xs">re_</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resend-from">بريد المرسل (RESEND_FROM)</Label>
            <Textarea
              id="resend-from"
              value={settings.RESEND_FROM}
              onChange={(e) => setSettings({ ...settings, RESEND_FROM: e.target.value })}
              placeholder='بوابة المنسقين <onboarding@resend.dev>'
              dir="ltr"
              disabled={saving}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              الصيغة: <code className="font-mono text-xs" dir="ltr">{'"الاسم <email@domain.com>"'}</code>
              <br />
              افتراضي Resend: <code className="font-mono text-xs" dir="ltr">onboarding@resend.dev</code>
              <br />
              للإرسال من نطاقك: أضف نطاقك في Resend ثم استخدم بريدك
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="size-5 text-muted-foreground" />
            إعدادات SMTP (احتياطية)
          </CardTitle>
          <CardDescription>
            تُستخدم فقط إذا لم تكن إعدادات Resend مفعّلة (Gmail, Outlook, Mailgun...)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={settings.SMTP_HOST}
                onChange={(e) => setSettings({ ...settings, SMTP_HOST: e.target.value })}
                placeholder="smtp.gmail.com"
                dir="ltr"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                value={settings.SMTP_PORT}
                onChange={(e) => setSettings({ ...settings, SMTP_PORT: e.target.value })}
                placeholder="587"
                dir="ltr"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                value={settings.SMTP_USER}
                onChange={(e) => setSettings({ ...settings, SMTP_USER: e.target.value })}
                placeholder="your-email@gmail.com"
                dir="ltr"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password / App Password</Label>
              <Input
                id="smtp-pass"
                type="password"
                value={settings.SMTP_PASS}
                onChange={(e) => setSettings({ ...settings, SMTP_PASS: e.target.value })}
                placeholder="••••••••"
                dir="ltr"
                disabled={saving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-from">بريد المرسل (SMTP_FROM)</Label>
            <Input
              id="smtp-from"
              value={settings.SMTP_FROM}
              onChange={(e) => setSettings({ ...settings, SMTP_FROM: e.target.value })}
              placeholder='بوابة المنسقين <your-email@gmail.com>'
              dir="ltr"
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
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
