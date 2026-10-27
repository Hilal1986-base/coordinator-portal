'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Mail, Loader2, ArrowRight } from 'lucide-react'
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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل', description: data.error, variant: 'destructive' })
        return
      }
      setSent(true)
      toast({ title: 'تم الإرسال', description: data.message })
    } catch (err) {
      console.error(err)
      toast({ title: 'فشل الاتصال', description: 'تحقق من الشبكة', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <KeyRound className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">نسيت كلمة المرور</h1>
          <p className="text-sm text-muted-foreground mt-1">دائرة المعلوماتية</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              {sent
                ? 'تم إرسال رابط إعادة التعيين إلى بريدك (إذا كان موجوداً)'
                : 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
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
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Mail className="size-4" />
                      إرسال رابط إعادة التعيين
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 text-sm">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ تم إرسال البريد بنجاح. تحقق من صندوق الوارد (وقد تجده في الرسائل غير المرغوبة).
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/auth/login')}
                >
                  <ArrowRight className="size-4" />
                  العودة لتسجيل الدخول
                </Button>
              </div>
            )}

            {!sent && (
              <div className="text-center text-sm pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="text-muted-foreground hover:text-primary flex items-center gap-1 mx-auto w-fit"
                >
                  <ArrowRight className="size-3.5" />
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
