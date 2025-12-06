import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, StickyNote, Sparkles, CheckCircle2, Circle, Plus, ArrowRight } from 'lucide-react';
import { Task } from '@/types/task';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import penguinCharacter from '@/assets/penguin-character.png';

interface HomeProps {
  tasks?: Task[];
  onToggleComplete?: (taskId: string) => void;
  onNavigate?: (page: string) => void;
}

export const Home = ({ tasks = [], onToggleComplete = () => {}, onNavigate = () => {} }: HomeProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Get today's tasks
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => task.date === todayStr)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      });
  }, [tasks, todayStr]);

  // Get upcoming tasks (next 7 days, excluding today)
  const upcomingTasks = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate > today && taskDate <= nextWeek && !task.completed;
    }).slice(0, 3);
  }, [tasks, today]);

  // Get recent notes
  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [notes]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding for start of week
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

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50 overflow-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-gray-900 mb-1"
            >
              {greeting}! 🐧
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500"
            >
              Here is your agenda for today
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <CalendarIcon className="h-4 w-4 text-sky-500" />
            <span className="font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</span>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 auto-rows-min">
        {/* Left Column - Calendar & Quick Actions */}
        <div className="col-span-5 space-y-6">
          {/* Mini Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-9" />;
                
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
                      "h-9 rounded-lg text-sm relative flex items-center justify-center transition-all",
                      isCurrentMonth ? "text-gray-700" : "text-gray-300",
                      isToday 
                        ? "bg-sky-500 text-white font-semibold shadow-md" 
                        : "hover:bg-gray-100",
                    )}
                  >
                    {format(day, 'd')}
                    {dayTasks.length > 0 && !isToday && (
                      <span className={cn(
                        "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        hasIncompleteTasks ? "bg-sky-400" : "bg-green-400"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('calendar')}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/50 hover:from-sky-100 hover:to-sky-100 transition-all border border-sky-100"
              >
                <div className="p-2 bg-sky-500 rounded-lg">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">New Task</span>
              </button>
              <button
                onClick={() => onNavigate('notes')}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-100 transition-all border border-amber-100"
              >
                <div className="p-2 bg-amber-500 rounded-lg">
                  <StickyNote className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">New Note</span>
              </button>
              <button
                onClick={() => onNavigate('meditation')}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-100 transition-all border border-purple-100"
              >
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Meditate</span>
              </button>
              <button
                onClick={() => onNavigate('tasks')}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-100 transition-all border border-green-100"
              >
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Tasks</span>
              </button>
            </div>
          </motion.div>

          {/* Recent Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Notes</h2>
              <button 
                onClick={() => onNavigate('notes')}
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentNotes.length === 0 ? (
              <div className="text-center py-6">
                <StickyNote className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notes yet</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('notes')}
                  className="mt-2 text-sky-600"
                >
                  Create your first note
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-800 truncate">{note.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Tasks */}
        <div className="col-span-7 space-y-6">
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 opacity-20">
              <img src={penguinCharacter} alt="" className="h-32 w-32 object-contain" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-medium mb-2">Today's Progress</h2>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-5xl font-bold">{completedToday}</span>
                <span className="text-xl opacity-80 mb-1">/ {totalToday} tasks</span>
              </div>
              {totalToday > 0 && (
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedToday / totalToday) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              )}
              {totalToday === 0 && (
                <p className="text-sm opacity-80">No tasks scheduled for today</p>
              )}
            </div>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Today's Tasks</h2>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No tasks for today</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('calendar')}
                  className="mt-2 text-sky-600"
                >
                  Add a task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todaysTasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      task.completed 
                        ? "bg-gray-50 border-gray-100" 
                        : "bg-white border-gray-200 hover:border-sky-200 hover:shadow-sm"
                    )}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => onToggleComplete(task.id)}
                      className="h-5 w-5 rounded-md border-2"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "text-sm font-medium truncate",
                        task.completed ? "text-gray-400 line-through" : "text-gray-800"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {task.time && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {task.time}
                          </span>
                        )}
                        {task.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {task.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      `bg-task-${task.color}`
                    )} 
                    style={{
                      backgroundColor: task.color === 'blue' ? 'hsl(210, 60%, 90%)' :
                        task.color === 'pink' ? 'hsl(340, 60%, 92%)' :
                        task.color === 'yellow' ? 'hsl(50, 85%, 88%)' :
                        task.color === 'green' ? 'hsl(140, 50%, 88%)' :
                        task.color === 'lavender' ? 'hsl(270, 50%, 92%)' :
                        task.color === 'peach' ? 'hsl(20, 70%, 90%)' :
                        'hsl(160, 45%, 88%)'
                    }}
                    />
                  </motion.div>
                ))}
                {todaysTasks.length > 5 && (
                  <button 
                    onClick={() => onNavigate('tasks')}
                    className="w-full text-center text-sm text-sky-600 hover:text-sky-700 py-2"
                  >
                    + {todaysTasks.length - 5} more tasks
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Upcoming</h2>
                <span className="text-xs text-gray-400">Next 7 days</span>
              </div>
              <div className="space-y-2">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
                  >
                    <Circle className="h-4 w-4 text-gray-300" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{task.title}</h4>
                    </div>
                    <span className="text-xs text-sky-600 font-medium whitespace-nowrap">
                      {format(new Date(task.date), 'MMM d')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
