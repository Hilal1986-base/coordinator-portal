import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-context";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "بوابة المنسقين في دائرة المعلوماتية",
  description: "بوابة المنسقين لرفع الملفات وإرسالها إلى بريد إلكتروني محدد عبر منصة آمنة.",
  keywords: ["بوابة منسقين", "دائرة المعلوماتية", "رفع ملفات", "إرسال بريد"],
  authors: [{ name: "دائرة المعلوماتية" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} antialiased bg-background text-foreground font-sans`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
