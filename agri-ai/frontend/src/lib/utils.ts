import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return value.toLocaleString('en-IN', { maximumFractionDigits: decimals })
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function formatArea(area: number | null | undefined, unit = 'hectares'): string {
  if (area === null || area === undefined) return '—'
  return `${area.toLocaleString('en-IN')} ${unit}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
