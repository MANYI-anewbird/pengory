import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, StickyNote, Sparkles, CheckCircle2, Circle, Plus, Bell } from 'lucide-react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface HomeProps {
  tasks?: Task[];
  onToggleComplete?: (taskId: string) => void;
  onNavigate?: (page: string) => void;
}

const REMINDERS_KEY = 'dashboard-reminders';

export const Home = ({ tasks = [], onToggleComplete = () => {}, onNavigate = () => {} }: HomeProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = addDays(today, 1).toISOString().split('T')[0];

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(REMINDERS_KEY);
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const handleAddReminder = () => {
    if (!newReminder.trim()) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      text: newReminder.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setReminders([reminder, ...reminders]);
    setNewReminder('');
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Get today's tasks
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => task.date === todayStr)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      });
  }, [tasks, todayStr]);

  // Get tomorrow's tasks
  const tomorrowsTasks = useMemo(() => {
    return tasks.filter(task => task.date === tomorrowStr)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      });
  }, [tasks, tomorrowStr]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startPadding = monthStart.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddedDays, ...days];
  }, [currentMonth]);

  // Tasks by date for calendar dots
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  const completedToday = todaysTasks.filter(t => t.completed).length;
  const totalToday = todaysTasks.length;
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Task card component
  const TaskCard = ({ task }: { task: Task }) => (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border transition-all",
      task.completed 
        ? "bg-gray-50 border-gray-100" 
        : "bg-white border-gray-200 hover:border-sky-200 hover:shadow-sm"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="h-3.5 w-3.5 rounded border-2"
      />
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-xs font-medium truncate",
          task.completed ? "text-gray-400 line-through" : "text-gray-800"
        )}>
          {task.title}
        </h4>
        {task.time && (
          <span className="flex items-center gap-1 text-2xs text-gray-400">
            <Clock className="h-2.5 w-2.5" />
            {task.time}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50 overflow-auto">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-900"
            >
              {greeting}! 🐧
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-gray-500"
            >
              Here is your agenda for today
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100"
          >
            <CalendarIcon className="h-3 w-3 text-sky-500" />
            <span className="font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</span>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Column - Calendar & Reminders */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          {/* Mini Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1 flex flex-col min-h-0"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-0.5">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateStr] || [];
                const hasIncompleteTasks = dayTasks.some(t => !t.completed);
                const isToday = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={dateStr}
                    onClick={() => onNavigate('calendar')}
                    className={cn(
                      "aspect-square rounded-lg text-sm relative flex items-center justify-center transition-all",
                      isCurrentMonth ? "text-gray-700" : "text-gray-300",
                      isToday 
                        ? "bg-sky-500 text-white font-semibold shadow-sm" 
                        : "hover:bg-gray-100",
                    )}
                  >
                    {format(day, 'd')}
                    {dayTasks.length > 0 && !isToday && (
                      <span className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        hasIncompleteTasks ? "bg-sky-400" : "bg-green-400"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1 flex flex-col min-h-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-base text-gray-900">Reminders</h2>
              <span className="text-xs text-gray-400 ml-auto">{reminders.filter(r => !r.completed).length} active</span>
            </div>
            
            {/* Add reminder input */}
            <div className="flex gap-1.5 mb-2">
              <Input
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReminder()}
                placeholder="Add a reminder..."
                className="flex-1 h-8 text-xs"
              />
              <Button 
                onClick={handleAddReminder}
                size="sm"
                className="h-8 px-3 bg-slate-800 hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Reminders list */}
            {reminders.length === 0 ? (
              <div className="text-center py-4 flex-1 flex flex-col items-center justify-center">
                <Bell className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No reminders yet</p>
                <p className="text-2xs text-gray-300 mt-0.5">Add things you want to remember</p>
              </div>
            ) : (
              <div className="space-y-1.5 flex-1 overflow-auto">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors group",
                      reminder.completed ? "bg-gray-50" : "bg-amber-50/50"
                    )}
                  >
                    <Checkbox
                      checked={reminder.completed}
                      onCheckedChange={() => handleToggleReminder(reminder.id)}
                      className="h-3.5 w-3.5 rounded border-2"
                    />
                    <span className={cn(
                      "flex-1 text-xs",
                      reminder.completed ? "text-gray-400 line-through" : "text-gray-700"
                    )}>
                      {reminder.text}
                    </span>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Progress + Today & Tomorrow Tasks */}
        <div className="col-span-7 flex flex-col gap-4 min-h-0">
          {/* Today's Progress Bar - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-3 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium">Today's Progress</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold">{completedToday}</span>
                <span className="text-sm opacity-70">/ {totalToday} tasks</span>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
              />
            </div>
            {totalToday === 0 && (
              <p className="text-xs opacity-70 mt-1">No tasks scheduled for today</p>
            )}
          </motion.div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Today's Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col min-h-0"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base text-gray-900">Today's Tasks</h2>
                <span className="text-xs text-gray-400">{format(today, 'MMM d')}</span>
              </div>
              
              {todaysTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-gray-400 text-xs">No tasks for today</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('calendar')}
                    className="mt-1 text-sky-600 text-xs h-7"
                  >
                    Add a task
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 flex-1 overflow-auto">
                  {todaysTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Tomorrow's Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col min-h-0"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base text-gray-900">Tomorrow</h2>
                <span className="text-xs text-gray-400">{format(addDays(today, 1), 'MMM d')}</span>
              </div>
              
              {tomorrowsTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <Circle className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-gray-400 text-xs">No tasks for tomorrow</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onNavigate('calendar')}
                    className="mt-1 text-sky-600 text-xs h-7"
                  >
                    Plan ahead
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 flex-1 overflow-auto">
                  {tomorrowsTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar - Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 pb-3"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Quick Actions</span>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all flex-1"
            >
              <Plus className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">New Task</span>
            </button>
            <button
              onClick={() => onNavigate('notes')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all flex-1"
            >
              <StickyNote className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">New Note</span>
            </button>
            <button
              onClick={() => onNavigate('meditation')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all flex-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">Meditate</span>
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all flex-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">View Tasks</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
