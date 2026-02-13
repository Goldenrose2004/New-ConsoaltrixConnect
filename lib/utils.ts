import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a timestamp to date and time in user's local timezone
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @returns An object with formatted date and time strings
 */
export function formatTimestampWithTimezone(timestamp: string | Date | null | undefined): { date: string | null; time: string | null } {
  if (!timestamp) {
    return { date: null, time: null }
  }

  try {
    const date = new Date(timestamp)
    
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    return { date: formattedDate, time: formattedTime }
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return { date: null, time: null }
  }
}
