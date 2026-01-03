import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { sampleTasks } from '@/data/sampleTasks';
import { PompomBorder } from '@/components/calendar/PompomBorder';
import { Sidebar } from '@/components/calendar/Sidebar';
import { CompactHeader } from '@/components/calendar/CompactHeader';
import { CompactCalendarGrid } from '@/components/calendar/CompactCalendarGrid';
import { TaskModal } from '@/components/calendar/TaskModal';
import { Notes } from './Notes';
import { Home } from './Home';
import { Tasks } from './Tasks';
import { Meditation } from './Meditation';
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

  const closeTaskModal = () => {
    // Ensure Radix portals (select/dialog) have a chance to clean up before we unmount.
    (document.activeElement as HTMLElement | null)?.blur?.();
    requestAnimationFrame(() => {
      setIsModalOpen(false);
      setEditingTask(undefined);
    });
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

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (task) {
      toast({
        title: 'Task deleted',
        description: task.title,
      });
    }
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
          onNavigate={setActivePage}
          activePage={activePage}
        />
        
        {activePage === 'home' ? (
          <Home 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onNavigate={setActivePage}
          />
        ) : activePage === 'tasks' ? (
          <Tasks 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onUpdateTask={handleUpdateTask}
          />
        ) : activePage === 'notes' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Notes />
          </div>
        ) : activePage === 'meditation' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Meditation />
          </div>
        ) : activePage === 'learn' ? (
          <Learn />
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
    </PompomBorder>
  );
};

export default Index;
