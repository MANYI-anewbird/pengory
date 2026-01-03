import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface CompactTaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
  denseMode: boolean;
}

export const CompactTaskItem = ({
  task,
  onToggleComplete,
  onDelete,
  onClick,
  denseMode,
}: CompactTaskItemProps) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(task);
  };

  const fullText = task.time && !task.allDay ? `${task.time} ${task.title}` : task.title;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          title={fullText}
          onClick={handleTaskClick}
          className={cn(
            'group flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:bg-gray-100/80 hover:shadow-xs hover:scale-[1.01] rounded-sm px-1 py-0.5 leading-none'
          )}
        >
          <div onClick={handleCheckboxClick} className="flex-shrink-0">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className={cn(
                'rounded-sm h-3.5 w-3.5',
                task.priority === 'high' 
                  ? 'border-rose-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 data-[state=checked]:text-white'
                  : 'border border-muted-foreground/60 data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white'
              )}
            />
          </div>
          <div className={cn('flex-1 min-w-0 flex items-baseline gap-1', task.completed && 'opacity-60')}>
            {task.time && !task.allDay && (
              <span
                className={cn(
                  'text-2xs text-gray-400 flex-shrink-0 leading-none',
                  task.completed && 'line-through'
                )}
              >
                {task.time}
              </span>
            )}
            <span
              className={cn(
                'font-normal truncate block leading-none text-xs',
                task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'
              )}
            >
              {task.title}
            </span>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 bg-white shadow-xl border border-gray-200/60 z-50">
        <ContextMenuItem
          className="focus:bg-gray-100 cursor-pointer transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
        >
          <span className="mr-2 text-sm">✏️</span>
          Edit Task
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
