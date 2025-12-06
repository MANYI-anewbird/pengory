import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [denseMode, setDenseMode] = useState(false);
  const [activePage, setActivePage] = useState('calendar');
  const { toast } = useToast();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
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
    setIsModalOpen(false);
    setEditingTask(undefined);
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
          <Home />
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
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
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

          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(undefined);
            }}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            initialDate={selectedDate}
            editTask={editingTask}
          />
          </div>
        )}
      </div>
    </PompomBorder>
  );
};

export default Index;
