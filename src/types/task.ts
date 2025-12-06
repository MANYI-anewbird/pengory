export type TaskColor = 'blue' | 'pink' | 'yellow' | 'green' | 'lavender' | 'peach' | 'mint';
export type Availability = 'busy' | 'free';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:mm format
  allDay: boolean;
  completed: boolean;
  color: TaskColor;
  availability: Availability;
  repeat: boolean;
  deadline?: string;
  duration?: number; // in minutes
  location?: string;
}
