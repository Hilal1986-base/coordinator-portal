'use client'

import { useEffect, useState } from 'react'
import { Users, Trash2, Loader2, Shield, User as UserIcon, Mail, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-context'

interface Coordinator {
  id: string
  name: string
  email: string
  department: string
  role: string
  createdAt: string
  emailCount: number
}

export function CoordinatorsManager() {
  const { toast } = useToast()
  const { coordinator: currentUser } = useAuth()
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCoordinators = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coordinators', { cache: 'no-store' })
      if (!res.ok) throw new Error('فشل تحميل المنسقين')
      const data = await res.json()
      setCoordinators(data.coordinators)
    } catch (e) {
      toast({ title: 'فشل', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoordinators()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/coordinators?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'فشل', description: data.error, variant: 'destructive' })
        return
      }
      toast({ title: 'تم الحذف', description: 'تم حذف المنسق بنجاح' })
      fetchCoordinators()
    } catch (e) {
      toast({ title: 'فشل', description: 'خطأ في الشبكة', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5 text-primary" />
          المنسقون المسجلون ({coordinators.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {coordinators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            لا يوجد منسقون مسجلون بعد
          </p>
        ) : (
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-2">
              {coordinators.map((c) => {
                const isMe = currentUser?.id === c.id
                return (
                  <div
                    key={c.id}
                    className="rounded-lg border bg-card p-3 sm:p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`flex size-9 items-center justify-center rounded-full ${
                            c.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {c.role === 'admin' ? <Shield className="size-4" /> : <UserIcon className="size-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">
                              {c.name}
                              {isMe && <span className="text-xs text-muted-foreground"> (أنت)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground" dir="ltr">
                              <Mail className="size-3 inline ml-1" />
                              {c.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3" />
                            {c.department}
                          </span>
                          <span>·</span>
                          <span>{c.emailCount} إرسال</span>
                          <span>·</span>
                          <span>
                            {new Date(c.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.role === 'admin' ? (
                          <Badge variant="default" className="bg-primary gap-1">
                            <Shield className="size-3" />
                            مدير
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserIcon className="size-3" />
                            منسق
                          </Badge>
                        )}
                        {!isMe && c.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingId === c.id}
                                aria-label="حذف"
                              >
                                {deletingId === c.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف المنسق <strong>{c.name}</strong>؟
                                  سيتم حذف جميع إرسالاته ({c.emailCount}) نهائياً.
                                  لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(c.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف نهائي
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
