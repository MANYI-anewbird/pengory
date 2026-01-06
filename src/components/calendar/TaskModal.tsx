import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Repeat, Trash2, MapPin, Flag, CalendarIcon } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[400px] max-h-[85vh] p-0 overflow-hidden bg-gradient-to-b from-white to-stone-50/80 border-0 shadow-2xl shadow-black/10 rounded-2xl flex flex-col">
        {/* Header with gradient accent */}
        <div className="relative px-5 pt-5 pb-3 flex-shrink-0">
          <div 
            className={cn(
              "absolute inset-x-0 top-0 h-1 rounded-t-2xl",
              priority === 'high' && "bg-gradient-to-r from-rose-300 to-rose-500",
              priority === 'core' && "bg-gradient-to-r from-amber-300 to-amber-500",
              priority === 'low' && "bg-gradient-to-r from-stone-300 to-stone-400"
            )}
          />
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-stone-800">
              {editTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editTask ? 'Edit your task details' : 'Create a new task'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable content */}
        <div className="px-5 pt-2 pb-5 space-y-3 overflow-y-auto flex-1">
          {/* Title Input */}
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-medium h-10 rounded-lg border-stone-200/80 bg-white shadow-sm mb-1
                       placeholder:text-stone-400 focus:border-stone-300 focus:ring-2 focus:ring-stone-900/5"
          />

          {/* Time Section */}
          <div className="bg-white/60 rounded-lg p-3 space-y-2.5 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <Label className="text-sm font-medium text-stone-700">All Day</Label>
              </div>
              <Switch 
                checked={allDay} 
                onCheckedChange={setAllDay} 
                className="scale-90 data-[state=checked]:bg-gray-900"
              />
            </div>

            {!allDay && (
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Start</Label>
                  <div className="flex gap-1 items-center">
                    <Select value={startHour} onValueChange={setStartHour}>
                      <SelectTrigger className="w-12 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-xs">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-stone-400 text-xs">:</span>
                    <Select value={startMinute} onValueChange={setStartMinute}>
                      <SelectTrigger className="w-12 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {['00', '15', '30', '45'].map((m) => (
                          <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={startPeriod} onValueChange={(v) => setStartPeriod(v as 'AM' | 'PM')}>
                      <SelectTrigger className="w-14 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        <SelectItem value="AM" className="text-xs">AM</SelectItem>
                        <SelectItem value="PM" className="text-xs">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">End</Label>
                  <div className="flex gap-1 items-center">
                    <Select value={endHour} onValueChange={setEndHour}>
                      <SelectTrigger className="w-12 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-xs">{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-stone-400 text-xs">:</span>
                    <Select value={endMinute} onValueChange={setEndMinute}>
                      <SelectTrigger className="w-12 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        {['00', '15', '30', '45'].map((m) => (
                          <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={endPeriod} onValueChange={(v) => setEndPeriod(v as 'AM' | 'PM')}>
                      <SelectTrigger className="w-14 h-8 rounded-md border-stone-200 bg-stone-50/50 text-xs px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalled={false}>
                        <SelectItem value="AM" className="text-xs">AM</SelectItem>
                        <SelectItem value="PM" className="text-xs">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Repeat Section */}
          <div className="bg-white/60 rounded-lg p-3 space-y-2.5 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <Repeat className="h-3 w-3 text-white" />
                </div>
                <Label className="text-sm font-medium text-stone-700">Repeat</Label>
              </div>
              <Switch 
                checked={repeat} 
                onCheckedChange={setRepeat}
                className="scale-90 data-[state=checked]:bg-gray-900"
              />
            </div>

            {repeat && (
              <div className="space-y-2.5">
                {/* Date Range - inline */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-stone-400 uppercase tracking-wider">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-8 w-full justify-start text-left font-normal text-xs rounded-md border-stone-200 bg-stone-50/50",
                            !repeatStartDate && "text-stone-400"
                          )}
                        >
                          <CalendarIcon className="mr-1.5 h-3 w-3" />
                          {repeatStartDate ? format(parse(repeatStartDate, 'yyyy-MM-dd', new Date()), "MM/dd/yy") : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={repeatStartDate ? parse(repeatStartDate, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => setRepeatStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-stone-400 uppercase tracking-wider">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-8 w-full justify-start text-left font-normal text-xs rounded-md border-stone-200 bg-stone-50/50",
                            !repeatEndDate && "text-stone-400"
                          )}
                        >
                          <CalendarIcon className="mr-1.5 h-3 w-3" />
                          {repeatEndDate ? format(parse(repeatEndDate, 'yyyy-MM-dd', new Date()), "MM/dd/yy") : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={repeatEndDate ? parse(repeatEndDate, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => setRepeatEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Repeat Type */}
                <div className="flex gap-1.5">
                  {(['daily', 'weekly', 'monthly'] as RepeatType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRepeatType(type)}
                      className={cn(
                        "flex-1 h-7 rounded-md border text-xs font-medium transition-all capitalize",
                        repeatType === type 
                          ? "bg-stone-900 border-stone-900 text-white" 
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Weekly: Weekday Picker */}
                {repeatType === 'weekly' && (
                  <div className="flex gap-1">
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
                          "flex-1 h-7 rounded-md border text-[10px] font-medium transition-all",
                          selectedWeekdays.includes(day.value)
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Monthly: Day of Month Picker */}
                {repeatType === 'monthly' && (
                  <div className="grid grid-cols-7 gap-1">
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
                          "h-6 rounded text-[10px] font-medium transition-all border",
                          selectedMonthDays.includes(day)
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority & Location Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Priority */}
            <div className="bg-white/60 rounded-lg p-2.5 border border-stone-100">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded bg-rose-50 flex items-center justify-center">
                  <Flag className="h-2.5 w-2.5 text-rose-500" />
                </div>
                <Label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Priority</Label>
              </div>
              <div className="flex gap-1">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 h-7 rounded-md border text-[10px] font-medium transition-all",
                      priority === p.value 
                        ? cn(p.bgColor, p.color) 
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white/60 rounded-lg p-2.5 border border-stone-100">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center">
                  <MapPin className="h-2.5 w-2.5 text-white" />
                </div>
                <Label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Location</Label>
              </div>
              <Input
                placeholder="Optional"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-7 rounded-md border-stone-200 bg-stone-50/50 text-xs placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Fixed Actions Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-white/80 flex-shrink-0 flex items-center justify-between">
          {editTask && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="rounded-lg h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={onClose} 
              className="rounded-lg h-8 px-4 text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim() || !date}
              className="rounded-lg h-8 px-5 text-xs font-semibold shadow-sm bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-40"
            >
              {editTask ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
