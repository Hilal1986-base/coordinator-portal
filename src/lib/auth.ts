import { db } from './db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'employee-portal-secret-change-in-production'
const SESSION_COOKIE_NAME = 'session'
const SESSION_EXPIRY_DAYS = 7

export interface SessionPayload {
  id: string
  email: string
  name: string
  department: string
  role: string
}

// إنشاء توكن JWT
export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_EXPIRY_DAYS}d` })
}

// التحقق من التوكن
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload
    return decoded
  } catch {
    return null
  }
}

// تجزئة كلمة المرور
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// التحقق من كلمة المرور
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// إعدادات ملفات تعريف الارتباط للجلسة
export const sessionCookieConfig = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
}

// توليد رمز عشوائي لإعادة تعيين كلمة المرور
export function generateResetToken(): string {
  return Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join('') + Date.now().toString(36)
}

// التحقق من بريد إلكتروني صحيح
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// التحقق من قوة كلمة المرور (6+ أحرف)
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

// قائمة الدوائر
export const DEPARTMENTS = [
  'دائرة المعلوماتية',
  'دائرة التنظيم العمراني',
  'دائرة الأبنية',
  'دائرة الطرق',
  'دائرة الدراسات',
  'دائرة الطبوغرافيا',
  'دائرة الرقابة الداخلية',
  'دائرة التخطيط والإحصاء',
  'دائرة الآليات',
  'دائرة النفايات الصلبة',
  'مكتب الجاهزية',
  'دائرة مكتب المدير',
  'المخبر',
  'دائرة الديوان العام',
  'دائرة الموارد البشرية',
  'القسم الفني',
  'قسم التنمية الإدارية',
  'الدائرة القانونية',
  'الدائرة المالية',
  'دائرة التدريب والتأهيل',
  'دائرة التنظيم المؤسساتي',
]

// التحقق من أن البريد هو بريد المدير (من متغير البيئة ADMIN_EMAIL)
export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false
  return email.toLowerCase().trim() === adminEmail.toLowerCase().trim()
}

// تحديد دور المستخدم عند التسجيل/الدخول
export function determineRole(email: string): 'admin' | 'coordinator' {
  return isAdminEmail(email) ? 'admin' : 'coordinator'
}
