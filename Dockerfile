# ====== مرحلة البناء ======
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات الحزم أولاً (للتخزين المؤقت)
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت الحزم
RUN npm ci

# نسخ باقي الملفات
COPY . .

# توليد Prisma Client
RUN npx prisma generate

# البناء
RUN npm run build

# ====== مرحلة الإنتاج ======
FROM node:20-alpine AS runner

WORKDIR /app

# تفعيل وضع الإنتاج
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# إنشاء مستخدم غير root للأمان
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# نسخ الملفات من مرحلة البناء
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# إنشاء مجلدات للبيانات
RUN mkdir -p uploads db && chown -R nextjs:nodejs uploads db

# التبديل للمستخدم
USER nextjs

# فتح المنفذ
EXPOSE 3000

# فحص الصحة
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# تشغيل الخادم
CMD ["node", "server.js"]
