"use client"

import { useCmsContent } from "@/lib/cms/useCmsContent"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CmsContentProps {
  section: string
  contentKey: string
  defaultValue?: string
  as?: React.ElementType
  className?: string
  fallback?: React.ReactNode
  renderHtml?: boolean
}

export function CmsContent({
  section,
  contentKey,
  defaultValue = "",
  as: Component = "div",
  className,
  fallback,
  renderHtml = true,
}: CmsContentProps) {
  const { content, isLoading, error } = useCmsContent({
    section,
    key: contentKey,
    defaultValue,
  })

  if (isLoading) {
    return fallback || <Skeleton className={cn("h-4 w-full", className)} />
  }

  if (error) {
    console.error(`Error loading CMS content (${section}/${contentKey}):`, error)
    return <Component className={className}>{defaultValue}</Component>
  }

  if (renderHtml) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return <Component className={className}>{content}</Component>
} 