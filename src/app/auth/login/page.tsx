'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2, UserPlus, KeyRound } from 'lucide-react'
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
import { useAuth } from '@/components/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل تسجيل الدخول', description: data.error, variant: 'destructive' })
        setLoading(false)
        return
      }
      toast({ title: 'مرحباً بك', description: `أهلاً ${data.coordinator.name}` })
      // تحديث حالة المستخدم قبل التوجيه
      await refresh()
      // استخدام window.location.href لإعادة تحميل كاملة تلتقط الـ cookie
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      toast({ title: 'فشل الاتصال', description: 'تحقق من الشبكة', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Mail className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">بوابة المنسقين</h1>
          <p className="text-sm text-muted-foreground mt-1">دائرة المعلوماتية</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="size-5 text-primary" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى البوابة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coordinator@company.com"
                  required
                  disabled={loading}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <KeyRound className="size-3.5" />
                  نسيت كلمة المرور؟
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <UserPlus className="size-3.5" />
                  إنشاء حساب جديد
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
