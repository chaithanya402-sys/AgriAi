import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fresh-500/10 text-brand">
        <Leaf className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
