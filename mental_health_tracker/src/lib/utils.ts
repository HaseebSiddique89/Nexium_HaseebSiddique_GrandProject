import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getMoodEmoji(mood: string): string {
  const moodEmojis: Record<string, string> = {
    'excellent': '😊',
    'good': '🙂',
    'neutral': '😐',
    'bad': '😔',
    'terrible': '😢',
  }
  return moodEmojis[mood] || '😐'
}

export function getMoodColor(mood: string): string {
  const moodColors: Record<string, string> = {
    'excellent': 'text-green-600 bg-green-100',
    'good': 'text-blue-600 bg-blue-100',
    'neutral': 'text-yellow-600 bg-yellow-100',
    'bad': 'text-orange-600 bg-orange-100',
    'terrible': 'text-red-600 bg-red-100',
  }
  return moodColors[mood] || 'text-gray-600 bg-gray-100'
} 