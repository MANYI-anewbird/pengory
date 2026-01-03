export type Priority = 'high' | 'core' | 'low';
export type Availability = 'busy' | 'free';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:mm format
  allDay: boolean;
  completed: boolean;
  priority: Priority;
  availability: Availability;
  repeat: boolean;
  deadline?: string;
  duration?: number; // in minutes
  location?: string;
}
