import { useState, type KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { GrowthPlan, GrowthCategory } from '@/types/growth';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<GrowthPlan, 'id' | 'createdAt'>) => void;
  defaultCategory: GrowthCategory;
}

export const NewPlanModal = ({ isOpen, onClose, onSave, defaultCategory }: NewPlanModalProps) => {
  const [goal, setGoal] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedResults, setExpectedResults] = useState<string[]>(['']);

  const handleSave = () => {
    if (!goal.trim()) return;
    
    let duration = 'Ongoing';
    if (durationValue.trim()) {
      const value = durationValue.trim();
      const unit = durationUnit;
      const plural = value !== '1' ? 's' : '';
      duration = `${value} ${unit}${plural}`;
    }
    
    // Combine expected results into a single string
    const expectedResult = expectedResults
      .map((result, index) => `${index + 1}. ${result.trim()}`)
      .filter(result => result.trim().length > 2) // Filter out empty items (only "1. " or similar)
      .join('\n');
    
    onSave({
      category: defaultCategory,
      goal: goal.trim(),
      duration,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      executionSteps: [],
      notes: notes.trim(),
      expectedResult: expectedResult.trim(),
    });

    // Reset form
    setGoal('');
    setDurationValue('');
    setDurationUnit('month');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setExpectedResults(['']);
  };

  const addExpectedResult = () => {
    setExpectedResults([...expectedResults, '']);
  };

  const removeExpectedResult = (index: number) => {
    if (expectedResults.length > 1) {
      setExpectedResults(expectedResults.filter((_, i) => i !== index));
    }
  };

  const updateExpectedResult = (index: number, value: string) => {
    const updated = [...expectedResults];
    updated[index] = value;
    setExpectedResults(updated);
  };

  const handleExpectedResultKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If current line has content, add a new line
      if (expectedResults[index].trim()) {
        const updated = [...expectedResults];
        updated.splice(index + 1, 0, '');
        setExpectedResults(updated);
        // Focus the new input after a brief delay
        setTimeout(() => {
          const nextInput = document.getElementById(`expected-result-${index + 1}`);
          if (nextInput) {
            (nextInput as HTMLInputElement).focus();
          }
        }, 0);
      }
    } else if (e.key === 'Backspace' && !expectedResults[index] && expectedResults.length > 1) {
      // If current line is empty and user presses backspace, remove it
      e.preventDefault();
      removeExpectedResult(index);
      // Focus the previous input
      if (index > 0) {
        setTimeout(() => {
          const prevInput = document.getElementById(`expected-result-${index - 1}`);
          if (prevInput) {
            (prevInput as HTMLInputElement).focus();
          }
        }, 0);
      }
    }
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
            <Label htmlFor="goal" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
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
            <Label htmlFor="duration" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Duration
            </Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="Enter number"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white flex-1"
              />
              <Select value={durationUnit} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setDurationUnit(value)}>
                <SelectTrigger className="h-11 w-32 bg-slate-50 border-slate-200 focus:bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Start
              </Label>
              <Input
                id="startDate"
                type="date"
                lang="en"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                End
              </Label>
              <Input
                id="endDate"
                type="date"
                lang="en"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Expected Result */}
          <div className="space-y-2">
            <Label htmlFor="result" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Expected Result
            </Label>
            <div className="space-y-1">
              {expectedResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    <span className="text-base font-bold text-black">•</span>
                  </div>
                  <Input
                    id={`expected-result-${index}`}
                    placeholder="Describe your success criteria..."
                    value={result}
                    onChange={(e) => updateExpectedResult(index, e.target.value)}
                    onKeyDown={(e) => handleExpectedResultKeyDown(index, e)}
                    className="flex-1 border-0 border-b border-slate-200 rounded-none bg-transparent px-0 py-2 focus-visible:ring-0 focus-visible:border-slate-400 focus-visible:border-b-2"
                  />
                  {expectedResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpectedResult(index)}
                      className="flex-shrink-0 p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
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
