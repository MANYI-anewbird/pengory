import { useState, useEffect } from 'react';
import { Task, Priority } from '@/types/task';
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
import { Clock, Repeat, Trash2, MapPin, Flag, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

type RepeatType = 'daily' | 'weekly' | 'monthly';

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onDelete?: (taskId: string) => void;
  initialDate?: Date;
  editTask?: Task;
}

const priorities: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: 'high', label: 'Priority', color: 'text-rose-600', bgColor: 'bg-rose-100 border-rose-300' },
  { value: 'core', label: 'Core', color: 'text-amber-600', bgColor: 'bg-amber-100 border-amber-300' },
  { value: 'low', label: 'Low', color: 'text-stone-500', bgColor: 'bg-stone-100 border-stone-300' },
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
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [priority, setPriority] = useState<Priority>('core');
  const [location, setLocation] = useState('');
  
  // Repeat options state
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatStartDate, setRepeatStartDate] = useState('');
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1]); // Default to Monday
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([1]); // Default to 1st
  
  // Start time state
  const [startHour, setStartHour] = useState('9');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  
  // End time state
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse 24h time to 12h format
  const parse24hTo12h = (time24: string) => {
    if (!time24) return { hour: '9', minute: '00', period: 'AM' as const };
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' as const : 'AM' as const;
    const hour12 = h % 12 || 12;
    return { hour: hour12.toString(), minute: m.toString().padStart(2, '0'), period };
  };

  // Convert 12h to 24h format
  const to24h = (hour: string, minute: string, period: 'AM' | 'PM') => {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDate(editTask.date);
      setAllDay(editTask.allDay);
      setRepeat(editTask.repeat);
      setPriority(editTask.priority);
      setLocation(editTask.location || '');
      
      if (editTask.time) {
        const parsed = parse24hTo12h(editTask.time);
        setStartHour(parsed.hour);
        setStartMinute(parsed.minute);
        setStartPeriod(parsed.period);
        const endH = parseInt(parsed.hour) + 1;
        setEndHour(endH > 12 ? (endH - 12).toString() : endH.toString());
        setEndMinute(parsed.minute);
        setEndPeriod(endH > 12 || (endH === 12 && parsed.period === 'AM') ? 'PM' : parsed.period);
      }
      if (editTask.endTime) {
        const parsedEnd = parse24hTo12h(editTask.endTime);
        setEndHour(parsedEnd.hour);
        setEndMinute(parsedEnd.minute);
        setEndPeriod(parsedEnd.period);
      }
      // Repeat options
      if (editTask.repeatType) setRepeatType(editTask.repeatType as RepeatType);
      if (editTask.repeatStartDate) setRepeatStartDate(editTask.repeatStartDate);
      if (editTask.repeatEndDate) setRepeatEndDate(editTask.repeatEndDate);
      if (editTask.repeatWeekdays) setSelectedWeekdays(editTask.repeatWeekdays);
      if (editTask.repeatMonthDays) setSelectedMonthDays(editTask.repeatMonthDays);
    } else if (initialDate) {
      setDate(initialDate.toISOString().split('T')[0]);
      setTitle('');
      setAllDay(false);
      setRepeat(false);
      setPriority('core');
      setLocation('');
      setStartHour('9');
      setStartMinute('00');
      setStartPeriod('AM');
      setEndHour('10');
      setEndMinute('00');
      setEndPeriod('AM');
      setRepeatType('daily');
      setRepeatStartDate(initialDate.toISOString().split('T')[0]);
      setRepeatEndDate('');
      setSelectedWeekdays([1]);
      setSelectedMonthDays([1]);
    }
  }, [editTask, initialDate, isOpen]);

  const handleSave = () => {
    if (!title.trim() || !date) return;

    const startTime24 = to24h(startHour, startMinute, startPeriod);
    const endTime24 = to24h(endHour, endMinute, endPeriod);

    onSave({
      title: title.trim(),
      date,
      time: allDay ? undefined : startTime24,
      endTime: allDay ? undefined : endTime24,
      allDay,
      completed: editTask?.completed || false,
      priority,
      availability: 'busy',
      repeat,
      repeatType: repeat ? repeatType : undefined,
      repeatStartDate: repeat ? repeatStartDate : undefined,
      repeatEndDate: repeat ? repeatEndDate : undefined,
      repeatWeekdays: repeat && repeatType === 'weekly' ? selectedWeekdays : undefined,
      repeatMonthDays: repeat && repeatType === 'monthly' ? selectedMonthDays : undefined,
      location: location.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (editTask && onDelete) {
      onClose();
      requestAnimationFrame(() => onDelete(editTask.id));
    }
  };

  const selectedPriority = priorities.find((p) => p.value === priority);

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
            className={cn(
              "absolute inset-x-0 top-0 h-1 rounded-t-2xl",
              priority === 'high' && "bg-gradient-to-r from-rose-300 to-rose-500",
              priority === 'core' && "bg-gradient-to-r from-amber-300 to-amber-500",
              priority === 'low' && "bg-gradient-to-r from-stone-300 to-stone-400"
            )}
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

          {/* Time Section */}
          <div className="bg-white/60 rounded-xl p-4 space-y-4 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <Label className="text-sm font-medium text-stone-700">All Day</Label>
              </div>
              <Switch 
                checked={allDay} 
                onCheckedChange={setAllDay} 
                className="data-[state=checked]:bg-gray-900"
              />
            </div>

            {!allDay && (
              <div className="space-y-3">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Start</Label>
                  <div className="flex gap-2">
                    <Select value={startHour} onValueChange={setStartHour}>
                      <SelectTrigger className="w-16 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-sm">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-stone-400 font-medium">:</span>
                    <Select value={startMinute} onValueChange={setStartMinute}>
                      <SelectTrigger className="w-16 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {['00', '15', '30', '45'].map((m) => (
                          <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={startPeriod} onValueChange={(v) => setStartPeriod(v as 'AM' | 'PM')}>
                      <SelectTrigger className="w-20 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        <SelectItem value="AM" className="text-sm">AM</SelectItem>
                        <SelectItem value="PM" className="text-sm">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">End</Label>
                  <div className="flex gap-2">
                    <Select value={endHour} onValueChange={setEndHour}>
                      <SelectTrigger className="w-16 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-sm">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-stone-400 font-medium">:</span>
                    <Select value={endMinute} onValueChange={setEndMinute}>
                      <SelectTrigger className="w-16 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {['00', '15', '30', '45'].map((m) => (
                          <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={endPeriod} onValueChange={(v) => setEndPeriod(v as 'AM' | 'PM')}>
                      <SelectTrigger className="w-20 h-10 rounded-lg border-stone-200 bg-stone-50/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        <SelectItem value="AM" className="text-sm">AM</SelectItem>
                        <SelectItem value="PM" className="text-sm">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Repeat Section */}
          <div className="bg-white/60 rounded-xl p-4 space-y-4 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Repeat className="h-4 w-4 text-white" />
                </div>
                <Label className="text-sm font-medium text-stone-700">Repeat</Label>
              </div>
              <Switch 
                checked={repeat} 
                onCheckedChange={setRepeat}
                className="data-[state=checked]:bg-gray-900"
              />
            </div>

            {repeat && (
              <div className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-stone-500" />
                    <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Date Range</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-stone-400">From</Label>
                      <Input
                        type="date"
                        value={repeatStartDate}
                        onChange={(e) => setRepeatStartDate(e.target.value)}
                        className="h-9 rounded-lg border-stone-200 bg-stone-50/50 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-stone-400">To</Label>
                      <Input
                        type="date"
                        value={repeatEndDate}
                        onChange={(e) => setRepeatEndDate(e.target.value)}
                        className="h-9 rounded-lg border-stone-200 bg-stone-50/50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Repeat Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Frequency</Label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as RepeatType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRepeatType(type)}
                        className={cn(
                          "flex-1 h-9 rounded-lg border text-sm font-medium transition-all duration-200",
                          "hover:scale-[1.02] hover:shadow-sm capitalize",
                          repeatType === type 
                            ? "bg-stone-900 border-stone-900 text-white" 
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly: Weekday Picker */}
                {repeatType === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Repeat On</Label>
                    <div className="flex gap-1.5">
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            setSelectedWeekdays((prev) =>
                              prev.includes(day.value)
                                ? prev.filter((d) => d !== day.value)
                                : [...prev, day.value]
                            );
                          }}
                          className={cn(
                            "flex-1 h-9 rounded-lg border text-xs font-medium transition-all duration-200",
                            selectedWeekdays.includes(day.value)
                              ? "bg-stone-900 border-stone-900 text-white"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly: Day of Month Picker */}
                {repeatType === 'monthly' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Repeat On Day</Label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSelectedMonthDays((prev) =>
                              prev.includes(day)
                                ? prev.filter((d) => d !== day)
                                : [...prev, day]
                            );
                          }}
                          className={cn(
                            "h-8 rounded-md border text-xs font-medium transition-all duration-200",
                            selectedMonthDays.includes(day)
                              ? "bg-stone-900 border-stone-900 text-white"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority Picker */}
          <div className="bg-white/60 rounded-xl p-4 border border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center">
                <Flag className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <Label className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Priority
              </Label>
            </div>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 h-9 rounded-lg border text-sm font-medium transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-sm",
                    priority === p.value 
                      ? cn(p.bgColor, p.color, "ring-2 ring-offset-1 ring-stone-300") 
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
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
