import { Home, TrendingUp, Calendar, StickyNote, Link, BookOpen, User, Settings, LogIn } from 'lucide-react';
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
  { icon: StickyNote, label: 'Notes', page: 'notes' },
  { icon: Link, label: 'Links', page: 'links' },
  { icon: BookOpen, label: 'Learn', page: 'learn' },
];

export const Sidebar = ({ denseMode, onNavigate, activePage }: SidebarProps) => {
  const { user, profile, loading } = useAuth();

  const bottomItems = user 
    ? [
        { icon: User, label: profile?.display_name || profile?.username || 'Profile', page: 'profile' },
        { icon: Settings, label: 'Settings', page: 'settings' },
      ]
    : [
        { icon: LogIn, label: '登录/注册', page: 'login' },
        { icon: Settings, label: 'Settings', page: 'settings' },
      ];

  const renderItem = (item: { icon: any; label: string; page: string }) => {
    const Icon = item.icon;
    const isActive = activePage === item.page;
    const isHome = item.page === 'home';
    const isProfile = item.page === 'profile' && user;
    
    return (
      <Tooltip key={item.label}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onNavigate(item.page)}
            className={cn(
              "flex items-center justify-center transition-all duration-200 mx-2 rounded-lg h-12",
              isProfile 
                ? "" // No background for profile item
                : isActive 
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
                    "h-14 w-14 object-contain transition-all duration-200 relative z-10"
                  )}
                />
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-white rounded-lg -z-10 scale-110" />
                    <div className="absolute inset-0 bg-white/50 rounded-lg blur-md -z-20 scale-125" />
                  </>
                )}
              </div>
            ) : isProfile ? (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isActive 
                  ? "bg-white text-gray-900 border border-gray-300 shadow-sm" 
                  : "bg-blue-800 text-white hover:scale-105"
              )}>
                {profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U'}
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
