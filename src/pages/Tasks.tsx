import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChevronDown, Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import antarcticLife from '@/assets/antarctic-life.png';
interface TasksProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const Tasks = ({ tasks, onToggleComplete, onUpdateTask }: TasksProps) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter tasks for today
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => task.date === today);
  }, [tasks, today]);

  // Sort tasks: incomplete first, then by time
  const sortedTasks = useMemo(() => {
    return [...todaysTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  }, [todaysTasks]);

  const completedCount = todaysTasks.filter(t => t.completed).length;
  const totalCount = todaysTasks.length;

  const handleToggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleNoteChange = (taskId: string, note: string) => {
    setTaskNotes(prev => ({ ...prev, [taskId]: note }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-light text-gray-900">Today's Tasks</h1>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formatDate(today)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {completedCount} of {totalCount} completed
            </div>
            {totalCount > 0 && (
              <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {sortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.img 
              src={antarcticLife} 
              alt="Relaxing penguin" 
              className="w-48 h-48 mb-6 drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            />
            <h2 className="text-3xl font-handwritten font-bold text-sky-700 mb-3">
              No tasks for today
            </h2>
            <p className="text-lg font-handwritten text-sky-500/80">
              Enjoy your free time or add some tasks in the calendar
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden transition-all duration-200",
                  task.completed && "opacity-60"
                )}
              >
                {/* Task Header */}
                <div className="p-5 flex items-center gap-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => onToggleComplete(task.id)}
                      className={cn(
                        "rounded-md border-2 border-gray-300",
                        "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
                        "h-5 w-5"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {task.time && !task.allDay && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{task.time}</span>
                        </div>
                      )}
                      {task.allDay && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          All Day
                        </span>
                      )}
                    </div>
                    <h3
                      className={cn(
                        "text-base font-medium",
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      )}
                    >
                      {task.title}
                    </h3>
                    {task.location && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {task.location}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleExpand(task.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <motion.div
                      animate={{ rotate: expandedTask === task.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </button>
                </div>

                {/* Task Details (Expandable) */}
                <AnimatePresence>
                  {expandedTask === task.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-5 bg-gray-50/50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Status:</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                task.availability === 'busy' 
                                  ? "bg-red-100 text-red-600" 
                                  : "bg-green-100 text-green-600"
                              )}>
                                {task.availability === 'busy' ? 'Busy' : 'Free'}
                              </span>
                            </div>
                            {task.repeat && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Repeat:</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                  Yes
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notes
                            </label>
                            <Textarea
                              value={taskNotes[task.id] || ''}
                              onChange={(e) => handleNoteChange(task.id, e.target.value)}
                              placeholder="Add notes about this task..."
                              className="min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
