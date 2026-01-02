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
import { Calendar, Clock, Repeat, AlertCircle, Briefcase, Palette, Trash2, MapPin } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onDelete?: (taskId: string) => void;
  initialDate?: Date;
  editTask?: Task;
}

const taskColors: { value: TaskColor; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'peach', label: 'Peach' },
  { value: 'mint', label: 'Mint' },
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

    onClose();
  };

  const handleDelete = () => {
    if (editTask && onDelete) {
      onDelete(editTask.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border/40 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {editTask ? 'Edit Task' : 'New Task'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editTask ? 'Edit your task details' : 'Create a new task'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-3">
          <div className="space-y-1">
            <Input
              placeholder="Task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm border-border focus:ring-primary h-9"
            />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium">All Day</Label>
              </div>
              <Switch checked={allDay} onCheckedChange={setAllDay} className="scale-90" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-2xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-border h-8 text-xs"
                />
              </div>
              {!allDay && (
                <div className="space-y-1">
                  <Label className="text-2xs text-muted-foreground">Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-border h-8 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium">Repeat</Label>
              </div>
              <Switch checked={repeat} onCheckedChange={setRepeat} className="scale-90" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium">Availability</Label>
              </div>
              <Select value={availability} onValueChange={(v) => setAvailability(v as Availability)}>
                <SelectTrigger className="border-border h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="busy" className="text-xs">Busy</SelectItem>
                  <SelectItem value="free" className="text-xs">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium">Color</Label>
              </div>
              <Select value={color} onValueChange={(v) => setColor(v as TaskColor)}>
                <SelectTrigger className="border-border h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskColors.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium">Location</Label>
              </div>
              <Input
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs border-border h-8"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          {editTask && onDelete ? (
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="rounded-md h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="rounded-md h-8 px-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !date}
              className="rounded-md h-8 px-3 text-xs bg-pompom-yellow hover:bg-pompom-yellow/90 text-pompom-brown"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
