/**
 * Date utility functions
 */
import { format, parseISO } from "date-fns";

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};

/**
 * Format a time string to a readable format
 */
export const formatTime = (timeString: string): string => {
  try {
    // Handle time string like "14:30:00" or "14:30"
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, "h:mm a");
  } catch (error) {
    return timeString;
  }
};

/**
 * Format a datetime string to a readable format
 */
export const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = parseISO(dateTimeString);
    return format(date, "MMM d, yyyy h:mm a");
  } catch (error) {
    return dateTimeString;
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * Get a date N days from now in YYYY-MM-DD format
 */
export const getDateDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return format(date, "yyyy-MM-dd");
};

/**
 * Format duration in minutes to human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};
