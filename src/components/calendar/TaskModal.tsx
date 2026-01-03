import { useState, useEffect } from 'react';
import { Task, TaskColor, Availability } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Repeat, Briefcase, Trash2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onDelete?: (taskId: string) => void;
  initialDate?: Date;
  editTask?: Task;
}

const taskColors: { value: TaskColor; label: string; hex: string }[] = [
  { value: 'blue', label: 'Sky', hex: '#3B82F6' },
  { value: 'pink', label: 'Rose', hex: '#EC4899' },
  { value: 'yellow', label: 'Amber', hex: '#F59E0B' },
  { value: 'green', label: 'Emerald', hex: '#10B981' },
  { value: 'lavender', label: 'Violet', hex: '#8B5CF6' },
  { value: 'peach', label: 'Coral', hex: '#F97316' },
  { value: 'mint', label: 'Teal', hex: '#14B8A6' },
];

export const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  editTask,
}: TaskModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [color, setColor] = useState<TaskColor>('blue');
  const [availability, setAvailability] = useState<Availability>('busy');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDate(editTask.date);
      setTime(editTask.time || '');
      setAllDay(editTask.allDay);
      setRepeat(editTask.repeat);
      setColor(editTask.color);
      setAvailability(editTask.availability);
      setLocation(editTask.location || '');
    } else if (initialDate) {
      setDate(initialDate.toISOString().split('T')[0]);
      setTitle('');
      setTime('');
      setAllDay(false);
      setRepeat(false);
      setColor('blue');
      setAvailability('busy');
      setLocation('');
    }
  }, [editTask, initialDate, isOpen]);

  const handleSave = () => {
    if (!title.trim() || !date) return;

    onSave({
      title: title.trim(),
      date,
      time: allDay ? undefined : time || undefined,
      allDay,
      completed: editTask?.completed || false,
      color,
      availability,
      repeat,
      location: location.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (editTask && onDelete) {
      onClose();
      requestAnimationFrame(() => onDelete(editTask.id));
    }
  };

  const selectedColor = taskColors.find((c) => c.value === color);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-gradient-to-b from-white to-stone-50/80 border-0 shadow-2xl shadow-black/10 rounded-2xl">
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4">
          <div 
            className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
            style={{ 
              background: `linear-gradient(90deg, ${selectedColor?.hex || '#3B82F6'}40, ${selectedColor?.hex || '#3B82F6'})`
            }}
          />
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-stone-800">
              {editTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editTask ? 'Edit your task details' : 'Create a new task'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="px-6 pb-6 space-y-5">
          {/* Title Input - Hero element */}
          <div className="relative">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-medium h-12 rounded-xl border-stone-200/80 bg-white shadow-sm 
                         placeholder:text-stone-400 focus:border-stone-300 focus:ring-2 focus:ring-stone-900/5
                         transition-all duration-200"
            />
          </div>

          {/* Date & Time Section */}
          <div className="bg-white/60 rounded-xl p-4 space-y-4 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <Label className="text-sm font-medium text-stone-700">All Day</Label>
              </div>
              <Switch 
                checked={allDay} 
                onCheckedChange={setAllDay} 
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm
                             focus:bg-white focus:border-stone-300 transition-all duration-200"
                />
              </div>
              {!allDay && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm
                               focus:bg-white focus:border-stone-300 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Repeat Toggle */}
            <div className="bg-white/60 rounded-xl p-3.5 border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
                  <Repeat className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <Label className="text-sm font-medium text-stone-700">Repeat</Label>
              </div>
              <Switch 
                checked={repeat} 
                onCheckedChange={setRepeat}
                className="scale-90 data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Availability */}
            <div className="bg-white/60 rounded-xl p-3.5 border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <Label className="text-sm font-medium text-stone-700">Status</Label>
              </div>
              <Select value={availability} onValueChange={(v) => setAvailability(v as Availability)}>
                <SelectTrigger className="h-8 rounded-lg border-stone-200 bg-stone-50/50 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent portalled={false}>
                  <SelectItem value="busy" className="text-xs">Busy</SelectItem>
                  <SelectItem value="free" className="text-xs">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Picker - Visual */}
          <div className="bg-white/60 rounded-xl p-4 border border-stone-100">
            <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3 block">
              Color Tag
            </Label>
            <div className="flex gap-2">
              {taskColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-200 relative",
                    "hover:scale-110 hover:shadow-md",
                    color === c.value && "ring-2 ring-offset-2 ring-stone-400 scale-110"
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {color === c.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white/90" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-rose-500" />
            </div>
            <Input
              placeholder="Add location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-14 h-11 rounded-xl border-stone-200 bg-white/60 text-sm
                         placeholder:text-stone-400 focus:bg-white focus:border-stone-300 transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {editTask && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className="rounded-xl h-10 px-4 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50
                           transition-all duration-200 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="rounded-xl h-10 px-5 text-sm font-medium text-stone-600 hover:bg-stone-100
                           transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !date}
                className="rounded-xl h-10 px-6 text-sm font-semibold shadow-md
                           bg-stone-900 hover:bg-stone-800 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                {editTask ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
