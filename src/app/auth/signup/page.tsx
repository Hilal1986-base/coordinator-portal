'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Lock, User, Building2, Loader2, LogIn } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { DEPARTMENTS } from '@/lib/auth'
import { useAuth } from '@/components/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refresh } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, department }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل التسجيل', description: data.error, variant: 'destructive' })
        setLoading(false)
        return
      }
      toast({ title: 'تم التسجيل بنجاح', description: `أهلاً ${data.coordinator.name}` })
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
              <UserPlus className="size-5 text-primary" />
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription>سجّل ببياناتك للوصول إلى البوابة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  اسم المنسق
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  required
                  disabled={loading}
                  minLength={2}
                />
              </div>
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
                  placeholder="6 أحرف على الأقل"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  الدائرة
                </Label>
                <Select value={department} onValueChange={setDepartment} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدائرة" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading || !department}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    إنشاء الحساب
                  </>
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="text-primary hover:underline flex items-center gap-1 font-medium mx-auto w-fit"
                >
                  <LogIn className="size-3.5" />
                  لديك حساب؟ سجل الدخول
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
