import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { sampleTasks } from '@/data/sampleTasks';
import { PompomBorder } from '@/components/calendar/PompomBorder';
import { Sidebar } from '@/components/calendar/Sidebar';
import { CompactHeader } from '@/components/calendar/CompactHeader';
import { CompactCalendarGrid } from '@/components/calendar/CompactCalendarGrid';
import { TaskModal } from '@/components/calendar/TaskModal';
import { DeleteRepeatTaskDialog } from '@/components/calendar/DeleteRepeatTaskDialog';
import { Notes } from './Notes';
import { Home } from './Home';
import { PersonalGrowth } from './PersonalGrowth';
import { Links } from './Links';
import { Learn } from './Learn';
import { toast as sonnerToast } from '@/components/ui/sonner';
import { getBostonNow } from '@/lib/timezone';
const TASKS_STORAGE_KEY = 'pompom_tasks_v1';

type ToastOptions = {
  title: string;
  description?: string;
  variant?: 'destructive';
};

const Index = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(getBostonNow());
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!raw) return sampleTasks;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Task[]) : sampleTasks;
    } catch {
      return sampleTasks;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [denseMode, setDenseMode] = useState(false);
  const [activePage, setActivePage] = useState('calendar');
  
  // Delete repeat task dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);

  const closeTaskModal = () => {
    // Close immediately; other mutations (save/delete) are already deferred to avoid Radix cleanup races.
    (document.activeElement as HTMLElement | null)?.blur?.();
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, { description });
      return;
    }
    sonnerToast(title, { description });
  };

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(getBostonNow());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? 'Task incomplete' : 'Task completed ✓',
        description: task.title,
      });
    }
  };

  // Helper to get original task ID from expanded task ID
  const getOriginalTaskId = (taskId: string) => {
    // Expanded tasks have IDs like "originalId_2024-01-15"
    const underscoreIndex = taskId.lastIndexOf('_');
    if (underscoreIndex > 0) {
      const possibleDate = taskId.substring(underscoreIndex + 1);
      // Check if the part after underscore looks like a date (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(possibleDate)) {
        return taskId.substring(0, underscoreIndex);
      }
    }
    return taskId;
  };

  const handleDeleteTask = (taskId: string) => {
    const originalId = getOriginalTaskId(taskId);
    const task = tasks.find((t) => t.id === originalId);

    if (!task) {
      // Try finding by the exact ID (for non-repeat tasks)
      const exactTask = tasks.find((t) => t.id === taskId);
      if (exactTask) {
        performDelete(taskId, exactTask);
      }
      return;
    }

    // If it's a repeat task, show the dialog
    if (task.repeat) {
      setPendingDeleteTaskId(taskId);
      setPendingDeleteTask(task);
      setDeleteDialogOpen(true);
    } else {
      performDelete(originalId, task);
    }
  };

  const performDelete = (taskId: string, task: Task) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    requestAnimationFrame(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast({
        title: 'Task deleted',
        description: task.title,
      });
    });
  };

  const handleDeleteSingleInstance = () => {
    if (!pendingDeleteTaskId || !pendingDeleteTask) return;

    // Extract the date from the instance ID
    const underscoreIndex = pendingDeleteTaskId.lastIndexOf('_');
    const instanceDate = pendingDeleteTaskId.substring(underscoreIndex + 1);
    
    // Add this date to an exclusion list in the task
    const originalId = getOriginalTaskId(pendingDeleteTaskId);
    
    (document.activeElement as HTMLElement | null)?.blur?.();
    requestAnimationFrame(() => {
      setTasks((prev) => prev.map((t) => {
        if (t.id === originalId) {
          const excludedDates = t.excludedDates || [];
          return { ...t, excludedDates: [...excludedDates, instanceDate] };
        }
        return t;
      }));
      toast({
        title: 'Instance deleted',
        description: `Removed ${instanceDate} from "${pendingDeleteTask.title}"`,
      });
    });

    setDeleteDialogOpen(false);
    setPendingDeleteTaskId(null);
    setPendingDeleteTask(null);
  };

  const handleDeleteAllInstances = () => {
    if (!pendingDeleteTaskId || !pendingDeleteTask) return;

    const originalId = getOriginalTaskId(pendingDeleteTaskId);
    
    (document.activeElement as HTMLElement | null)?.blur?.();
    requestAnimationFrame(() => {
      setTasks((prev) => prev.filter((t) => t.id !== originalId));
      toast({
        title: 'All instances deleted',
        description: pendingDeleteTask.title,
      });
    });

    setDeleteDialogOpen(false);
    setPendingDeleteTaskId(null);
    setPendingDeleteTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    // Close the modal first, then mutate the calendar DOM on the next frame.
    // This avoids a Radix (Dialog/ScrollLock) cleanup race that can throw "removeChild".
    closeTaskModal();

    requestAnimationFrame(() => {
      if (editingTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingTask.id ? { ...taskData, id: task.id } : task
          )
        );
        toast({
          title: 'Task updated',
          description: taskData.title,
        });
      } else {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
        };
        setTasks((prev) => [...prev, newTask]);
        toast({
          title: 'Task created',
          description: taskData.title,
        });
      }
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  return (
    <PompomBorder>
      <div className="flex h-full">
        <Sidebar 
          denseMode={denseMode} 
          onNavigate={(page) => {
            if (page === 'login') {
              navigate('/auth');
            } else {
              setActivePage(page);
            }
          }}
          activePage={activePage}
        />
        
        {activePage === 'home' ? (
          <Home 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onNavigate={setActivePage}
          />
        ) : activePage === 'growth' ? (
          <PersonalGrowth />
        ) : activePage === 'links' ? (
          <Links />
        ) : activePage === 'learn' ? (
          <Learn />
        ) : activePage === 'notes' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Notes />
          </div>
        ) : activePage === 'calendar' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <CompactHeader
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              denseMode={denseMode}
              onDenseModeChange={setDenseMode}
            />
            
            <CompactCalendarGrid
              currentDate={currentDate}
              tasks={tasks}
              onDayClick={handleDayClick}
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              denseMode={denseMode}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Page not found
          </div>
        )}
      </div>
      
      {/* Task Modal - rendered outside conditional to avoid unmounting issues */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialDate={selectedDate}
        editTask={editingTask}
      />

      {/* Delete Repeat Task Dialog */}
      <DeleteRepeatTaskDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPendingDeleteTaskId(null);
          setPendingDeleteTask(null);
        }}
        onDeleteSingle={handleDeleteSingleInstance}
        onDeleteAll={handleDeleteAllInstances}
        taskTitle={pendingDeleteTask?.title || ''}
      />
    </PompomBorder>
  );
};

export default Index;
