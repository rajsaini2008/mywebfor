"use client"

import { useToast } from "./use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, setToasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-lg border p-4 shadow-md transition-all
            ${toast.variant === "destructive" ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-medium ${toast.variant === "destructive" ? "text-red-800" : "text-gray-900"}`}>
                {toast.title}
              </h3>
              {toast.description && (
                <p className={`mt-1 text-sm ${toast.variant === "destructive" ? "text-red-700" : "text-gray-500"}`}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-md ${
                toast.variant === "destructive" ? "text-red-700 hover:bg-red-100" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
