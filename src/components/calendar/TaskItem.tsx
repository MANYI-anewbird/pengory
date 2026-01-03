import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

const priorityClasses: Record<Task['priority'], string> = {
  high: 'bg-rose-50 border-rose-200',
  core: 'bg-amber-50 border-amber-200',
  low: 'bg-stone-50 border-stone-200',
};

export const TaskItem = ({ task, onToggleComplete, onClick }: TaskItemProps) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        'group flex items-start gap-2 px-2 py-1.5 mb-1 rounded-md border cursor-pointer',
        'transition-all duration-200 hover:shadow-sm hover:scale-[1.01]',
        priorityClasses[task.priority],
        task.completed && 'opacity-60'
      )}
    >
      <div onClick={handleCheckboxClick} className="mt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className={cn(
            "h-4 w-4 rounded border-2",
            task.priority === 'high' && task.completed && "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {task.time && !task.allDay && (
            <span className="text-xs text-muted-foreground font-medium">
              {task.time}
            </span>
          )}
          <span
            className={cn(
              'text-sm font-medium text-foreground truncate',
              task.completed && 'line-through'
            )}
          >
            {task.title}
          </span>
        </div>
      </div>
    </div>
  );
};
