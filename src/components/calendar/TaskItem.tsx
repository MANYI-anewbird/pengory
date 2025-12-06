import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

const taskColorClasses: Record<Task['color'], string> = {
  blue: 'bg-task-blue border-blue-300',
  pink: 'bg-task-pink border-pink-300',
  yellow: 'bg-task-yellow border-yellow-300',
  green: 'bg-task-green border-green-300',
  lavender: 'bg-task-lavender border-purple-300',
  peach: 'bg-task-peach border-orange-300',
  mint: 'bg-task-mint border-teal-300',
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
        taskColorClasses[task.color],
        task.completed && 'opacity-60'
      )}
    >
      <div onClick={handleCheckboxClick} className="mt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="h-4 w-4 rounded border-2"
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
