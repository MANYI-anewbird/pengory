import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Boston timezone (Eastern Time)
export const BOSTON_TIMEZONE = 'America/New_York';

/**
 * Get the current date/time in Boston timezone
 */
export const getBostonNow = (): Date => {
  return toZonedTime(new Date(), BOSTON_TIMEZONE);
};

/**
 * Convert a UTC date to Boston timezone
 */
export const toBostonTime = (date: Date): Date => {
  return toZonedTime(date, BOSTON_TIMEZONE);
};

/**
 * Format a date in Boston timezone
 */
export const formatInBoston = (date: Date, formatStr: string): string => {
  return formatInTimeZone(date, BOSTON_TIMEZONE, formatStr);
};

/**
 * Get today's date string in Boston timezone (YYYY-MM-DD format)
 */
export const getBostonTodayStr = (): string => {
  return formatInTimeZone(new Date(), BOSTON_TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Get current hour in Boston timezone (for greeting)
 */
export const getBostonHour = (): number => {
  const bostonNow = getBostonNow();
  return bostonNow.getHours();
};
