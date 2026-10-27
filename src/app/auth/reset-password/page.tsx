'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      toast({ title: 'خطأ', description: 'الرمز مفقود', variant: 'destructive' })
      router.push('/auth/login')
    }
  }, [token, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'خطأ', description: 'كلمتا المرور غير متطابقتين', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل', description: data.error, variant: 'destructive' })
        return
      }
      setDone(true)
      toast({ title: 'تم التحديث', description: 'تم تحديث كلمة المرور بنجاح' })
    } catch (err) {
      console.error(err)
      toast({ title: 'فشل الاتصال', description: 'تحقق من الشبكة', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                  <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold">تم تحديث كلمة المرور</h2>
                <p className="text-muted-foreground">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
                <Button className="w-full" size="lg" onClick={() => router.push('/auth/login')}>
                  <ArrowRight className="size-4" />
                  تسجيل الدخول
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <KeyRound className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">كلمة المرور الجديدة</h1>
          <p className="text-sm text-muted-foreground mt-1">دائرة المعلوماتية</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>أدخل كلمة المرور الجديدة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    تحديث كلمة المرور
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
