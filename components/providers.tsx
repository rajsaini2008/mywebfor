'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { EnsureAdmin } from "@/components/ensure-admin"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <EnsureAdmin />
        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  )
} 