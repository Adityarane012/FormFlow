import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FormFlow — No-code forms",
  description: "Build and share beautiful forms. Schema-driven, realtime, minimal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
