import { Home, TrendingUp, Calendar, StickyNote, Link, BookOpen, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import penguinLogo from '@/assets/penguin-logo.png';

interface SidebarProps {
  denseMode: boolean;
  onNavigate: (page: string) => void;
  activePage: string;
}

const mainItems = [
  { icon: Home, label: 'Home', page: 'home' },
  { icon: Calendar, label: 'Calendar', page: 'calendar' },
  { icon: TrendingUp, label: 'Growth', page: 'growth' },
  { icon: Link, label: 'Links', page: 'links' },
  { icon: BookOpen, label: 'Learn', page: 'learn' },
  { icon: StickyNote, label: 'Notes', page: 'notes' },
];

export const Sidebar = ({ denseMode, onNavigate, activePage }: SidebarProps) => {
  const { user } = useAuth();

  const bottomItems = user 
    ? []
    : [
        { icon: LogIn, label: 'Login/Register', page: 'login' },
      ];

  const renderItem = (item: { icon: any; label: string; page: string }) => {
    const Icon = item.icon;
    const isActive = activePage === item.page;
    const isHome = item.page === 'home';
    
    return (
      <Tooltip key={item.label}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onNavigate(item.page)}
            className={cn(
              "flex items-center justify-center transition-all duration-200 mx-2 rounded-lg h-12",
              isHome
                ? "bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                : isActive 
                  ? "bg-gray-900 text-white shadow-md scale-105" 
                  : "text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:scale-105"
            )}
          >
            {isHome ? (
              <img 
                src={penguinLogo} 
                alt="Pengory Logo" 
                className={cn(
                  "h-16 w-16 object-contain transition-all duration-200"
                )}
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-arial">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="border-r border-gray-200/60 bg-white flex flex-col w-16 py-4 shadow-xs">
        {/* Main navigation items */}
        <div className="flex flex-col gap-2">
          {mainItems.map(renderItem)}
        </div>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Bottom items - Profile & Settings */}
        <div className="flex flex-col gap-2">
          {bottomItems.map(renderItem)}
        </div>
      </div>
    </TooltipProvider>
  );
};
