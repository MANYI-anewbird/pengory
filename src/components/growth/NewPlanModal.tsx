import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GrowthPlan, GrowthCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/growth';
import { cn } from '@/lib/utils';
import { Heart, Brain, Languages, Palette } from 'lucide-react';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<GrowthPlan, 'id' | 'createdAt'>) => void;
  defaultCategory: GrowthCategory;
}

const CATEGORY_ICONS: Record<GrowthCategory, any> = {
  health: Heart,
  skills: Brain,
  language: Languages,
  hobby: Palette,
};

export const NewPlanModal = ({ isOpen, onClose, onSave, defaultCategory }: NewPlanModalProps) => {
  const [category, setCategory] = useState<GrowthCategory>(defaultCategory);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedResult, setExpectedResult] = useState('');

  const handleSave = () => {
    if (!goal.trim()) return;
    
    onSave({
      category,
      goal: goal.trim(),
      duration: duration.trim() || 'Ongoing',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      executionSteps: [],
      notes: notes.trim(),
      expectedResult: expectedResult.trim(),
    });

    // Reset form
    setGoal('');
    setDuration('');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setExpectedResult('');
  };

  const categories: GrowthCategory[] = ['health', 'skills', 'language', 'hobby'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Growth Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                      category === cat
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <div className={cn('p-1.5 rounded-md', CATEGORY_COLORS[cat])}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal */}
          <div>
            <Label htmlFor="goal">Goal *</Label>
            <Input
              id="goal"
              placeholder="e.g., Lose 5kg, Learn Python, etc."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="e.g., 2 months, 6 weeks"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes & Reminders</Label>
            <Textarea
              id="notes"
              placeholder="Important things to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Expected Result */}
          <div>
            <Label htmlFor="result">Expected Result</Label>
            <Textarea
              id="result"
              placeholder="What do you want to achieve?"
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!goal.trim()}>
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
