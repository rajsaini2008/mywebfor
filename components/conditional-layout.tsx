"use client"

import React from "react"
import { usePathname } from "next/navigation"
import MainWrapper from "@/components/MainWrapper"

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't show header/footer for login, admin, student, or ATC dashboard pages
  // But show them for verification pages and other public pages
  const hideHeaderFooter = 
    pathname === '/login' || 
    pathname?.startsWith('/admin/') || 
    pathname?.startsWith('/student/') || 
    (pathname?.startsWith('/atc/') && !pathname?.startsWith('/atc-verification/'));

  if (hideHeaderFooter) {
    return <main>{children}</main>
  }

  return <MainWrapper>{children}</MainWrapper>
} 