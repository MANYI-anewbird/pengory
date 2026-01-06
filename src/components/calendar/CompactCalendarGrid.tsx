import { Task } from '@/types/task';
import { CompactDayCell } from './CompactDayCell';
import { cn } from '@/lib/utils';
import { getBostonNow, formatInBoston } from '@/lib/timezone';

interface CompactCalendarGridProps {
  currentDate: Date;
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  denseMode: boolean;
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysFromPrevMonth = firstDay.getDay();
  const daysInCurrentMonth = lastDay.getDate();
  const totalCells = Math.ceil((daysFromPrevMonth + daysInCurrentMonth) / 7) * 7;
  
  const days: Date[] = [];
  
  // Previous month days
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }
  
  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Next month days
  const remainingCells = totalCells - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const formatDateKey = (date: Date) => {
  return formatInBoston(date, 'yyyy-MM-dd');
};

export const CompactCalendarGrid = ({
  currentDate,
  tasks,
  onDayClick,
  onTaskClick,
  onToggleComplete,
  onDeleteTask,
  denseMode,
}: CompactCalendarGridProps) => {
  const days = getDaysInMonth(currentDate);
  const today = getBostonNow();
  const todayKey = formatDateKey(today);
  
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      <div className="grid grid-cols-7 border-l border-gray-200/40 shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              "text-center font-medium text-gray-400 border-r border-b border-gray-200/40 bg-gray-50/30 uppercase tracking-wide",
              denseMode ? "py-1 text-2xs" : "py-1.5 text-xs"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-gray-200/40 flex-1">
        {days.map((day, index) => {
          const dateKey = formatDateKey(day);
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = dateKey === todayKey;
          
          return (
            <CompactDayCell
              key={index}
              date={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              tasks={dayTasks}
              onDayClick={onDayClick}
              onTaskClick={onTaskClick}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              denseMode={denseMode}
            />
          );
        })}
      </div>
    </div>
  );
};
