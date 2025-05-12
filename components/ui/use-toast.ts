"use client"

import { useState, useEffect } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function toast(props: ToastProps) {
  // Create a custom event
  const event = new CustomEvent("toast", { detail: props })
  // Dispatch the event
  document.dispatchEvent(event)
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastProps>).detail
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { ...detail, id }])

      // Auto dismiss after specified duration or default 5 seconds
      const duration = detail.duration || 5000
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }

    document.addEventListener("toast", handleToast)
    return () => {
      document.removeEventListener("toast", handleToast)
    }
  }, [])

  return { toasts, setToasts }
}
