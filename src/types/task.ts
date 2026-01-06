export type Priority = 'high' | 'core' | 'low';
export type Availability = 'busy' | 'free';
export type RepeatType = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:mm format (start time)
  endTime?: string; // HH:mm format (end time)
  allDay: boolean;
  completed: boolean;
  priority: Priority;
  availability: Availability;
  repeat: boolean;
  repeatType?: RepeatType;
  repeatStartDate?: string; // YYYY-MM-DD format
  repeatEndDate?: string; // YYYY-MM-DD format
  repeatWeekdays?: number[]; // 0-6, Sunday = 0
  repeatMonthDays?: number[]; // 1-31
  deadline?: string;
  duration?: number; // in minutes
  location?: string;
}
