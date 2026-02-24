import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'dd MMM yyyy', { locale: it })
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: it })
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it })
}

export function generateCardNumber(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `CC-${num}`
}
