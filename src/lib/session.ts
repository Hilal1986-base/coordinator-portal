import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, sessionCookieConfig } from './auth'

export async function getSession(request: NextRequest) {
  const cookie = request.cookies.get(sessionCookieConfig.name)
  if (!cookie) return null
  return verifySessionToken(cookie.value)
}

// تحقق من الجلسة وأعد توجيه إلى تسجيل الدخول إن لم توجد
export async function requireAuth(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return null
  return session
}
