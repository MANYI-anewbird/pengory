import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
}

export const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode,
  onViewModeChange,
}: CalendarHeaderProps) => {
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{monthYear}</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="h-8 w-8 rounded-lg hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-8 w-8 rounded-lg hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={onToday}
            className="ml-2 h-8 px-3 rounded-lg hover:bg-muted text-sm"
          >
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'week' ? 'secondary' : 'ghost'}
          onClick={() => onViewModeChange('week')}
          className="h-8 px-4 rounded-lg text-sm"
        >
          Week
        </Button>
        <Button
          variant={viewMode === 'month' ? 'secondary' : 'ghost'}
          onClick={() => onViewModeChange('month')}
          className="h-8 px-4 rounded-lg text-sm"
        >
          Month
        </Button>
      </div>
    </header>
  );
};
