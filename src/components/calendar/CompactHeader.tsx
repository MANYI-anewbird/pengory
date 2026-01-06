import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CompactHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  denseMode: boolean;
  onDenseModeChange: (dense: boolean) => void;
}

export const CompactHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  denseMode,
  onDenseModeChange,
}: CompactHeaderProps) => {
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear().toString();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white shadow-xs shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-black font-arial">
          {month} <span className="font-bold text-gray-600">{year}</span>
        </h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          className="h-9 w-9 rounded-lg hover:bg-gray-100 hover:shadow-xs transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-9 w-9 rounded-lg hover:bg-gray-100 hover:shadow-xs transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          onClick={onToday}
          className="h-9 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 hover:shadow-xs transition-all duration-200"
        >
          Today
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Label htmlFor="dense-mode" className="text-xs text-muted-foreground cursor-pointer">
          Dense
        </Label>
        <Switch
          id="dense-mode"
          checked={denseMode}
          onCheckedChange={onDenseModeChange}
        />
      </div>
    </header>
  );
};
