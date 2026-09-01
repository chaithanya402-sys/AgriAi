import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} />
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
      <LoadingSpinner className="h-8 w-8 text-brand" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  )
}

export function ButtonLoader({ label = 'Please wait…' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner className="h-4 w-4" />
      {label}
    </span>
  )
}
