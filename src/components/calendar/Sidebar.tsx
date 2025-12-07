import { Home, List, Calendar, StickyNote, Sparkles, Grid3x3, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import penguinLogo from '@/assets/penguin-logo.png';

interface SidebarProps {
  denseMode: boolean;
  onNavigate: (page: string) => void;
  activePage: string;
}

const mainItems = [
  { icon: Home, label: 'Home', page: 'home' },
  { icon: Calendar, label: 'Calendar', page: 'calendar' },
  { icon: List, label: 'Tasks', page: 'tasks' },
  { icon: StickyNote, label: 'Notes', page: 'notes' },
  { icon: Sparkles, label: 'Meditation', page: 'meditation' },
  { icon: Grid3x3, label: 'Apps', page: 'apps' },
];

const bottomItems = [
  { icon: User, label: 'Profile', page: 'profile' },
  { icon: Settings, label: 'Settings', page: 'settings' },
];

export const Sidebar = ({ denseMode, onNavigate, activePage }: SidebarProps) => {
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
              isActive 
                ? "bg-gray-900 text-white shadow-md scale-105" 
                : "text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:scale-105"
            )}
          >
            {isHome ? (
              <div className="relative">
                <img 
                  src={penguinLogo} 
                  alt="Penguin Logo" 
                  className={cn(
                    "h-10 w-10 object-contain transition-all duration-200 relative z-10"
                  )}
                />
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-white rounded-lg -z-10 scale-110" />
                    <div className="absolute inset-0 bg-white/50 rounded-lg blur-md -z-20 scale-125" />
                  </>
                )}
              </div>
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
