import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { cn } from '@/lib/utils';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export const DayCell = ({
  date,
  isCurrentMonth,
  isToday,
  tasks,
  onDayClick,
  onTaskClick,
  onToggleComplete,
}: DayCellProps) => {
  return (
    <div
      onClick={() => onDayClick(date)}
      className={cn(
        'min-h-[120px] p-2 border-b border-r border-border bg-card',
        'hover:bg-accent/30 transition-colors cursor-pointer',
        !isCurrentMonth && 'bg-muted/30'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-sm font-medium',
            isToday && 'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground',
            !isToday && isCurrentMonth && 'text-foreground',
            !isToday && !isCurrentMonth && 'text-muted-foreground'
          )}
        >
          {date.getDate()}
        </span>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onClick={(task) => {
              onTaskClick(task);
            }}
          />
        ))}
      </div>
    </div>
  );
};
