import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GrowthPlan, GrowthCategory } from '@/types/growth';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<GrowthPlan, 'id' | 'createdAt'>) => void;
  defaultCategory: GrowthCategory;
}

export const NewPlanModal = ({ isOpen, onClose, onSave, defaultCategory }: NewPlanModalProps) => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedResult, setExpectedResult] = useState('');

  const handleSave = () => {
    if (!goal.trim()) return;
    
    onSave({
      category: defaultCategory,
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-semibold">Create New Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Goal *
            </Label>
            <Input
              id="goal"
              placeholder="What do you want to achieve?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Duration
            </Label>
            <Input
              id="duration"
              placeholder="e.g., 2 months, 6 weeks"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Start
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                End
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Important things to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
            />
          </div>

          {/* Expected Result */}
          <div className="space-y-2">
            <Label htmlFor="result" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Expected Result
            </Label>
            <Textarea
              id="result"
              placeholder="Describe your success criteria..."
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              rows={2}
              className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!goal.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6"
          >
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
