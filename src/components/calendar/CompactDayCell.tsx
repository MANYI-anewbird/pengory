import { Task } from '@/types/task';
import { CompactTaskItem } from './CompactTaskItem';
import { cn } from '@/lib/utils';

interface CompactDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  denseMode: boolean;
}

export const CompactDayCell = ({
  date,
  isCurrentMonth,
  isToday,
  tasks,
  onDayClick,
  onTaskClick,
  onToggleComplete,
  onDeleteTask,
  denseMode,
}: CompactDayCellProps) => {
  return (
    <div
      onClick={() => onDayClick(date)}
      className={cn(
        'border-r border-b border-border hover:bg-accent/30 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col overflow-hidden',
        denseMode ? 'p-0.5' : 'p-1',
        isCurrentMonth ? 'bg-white' : 'bg-muted/30',
        isToday && 'ring-1 ring-blue-500/20'
      )}
    >
      <div className={cn(
        "flex items-center justify-start shrink-0",
        denseMode ? "mb-2" : "mb-2.5"
      )}>
        <span
          className={cn(
            'font-semibold leading-none',
            denseMode ? 'text-2xs' : 'text-xs',
            isToday && 'flex items-center justify-center rounded-full bg-blue-600 text-white',
            isToday && (denseMode ? 'w-4 h-4 text-2xs' : 'w-5 h-5 text-xs'),
            !isToday && isCurrentMonth && 'text-black',
            !isToday && !isCurrentMonth && 'text-gray-400'
          )}
        >
          {date.getDate()}
        </span>
      </div>
      <div className="space-y-0.5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {tasks.map((task) => (
          <CompactTaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteTask}
            onClick={(task) => {
              onTaskClick(task);
            }}
            denseMode={denseMode}
          />
        ))}
      </div>
    </div>
  );
};
