import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Brain, Palette, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthPlan, GrowthCategory, CATEGORY_LABELS } from '@/types/growth';
import { GrowthPlanCard } from '@/components/growth/GrowthPlanCard';
import { NewPlanModal } from '@/components/growth/NewPlanModal';
import { cn } from '@/lib/utils';

const GROWTH_STORAGE_KEY = 'pompom_growth_plans_v1';

// Vibrant theme colors for each category
const CATEGORY_CONFIG: Record<GrowthCategory, {
  icon: any;
  // Active button color
  activeBtn: string;
  // Icon/accent color
  accent: string;
  // Light background for content area
  lightBg: string;
  // Gradient for empty state
  emptyGradient: string;
  // Border color
  border: string;
  // Dot/ring color
  dotColor: string;
  ringStroke: string;
}> = {
  health: {
    icon: Heart,
    activeBtn: 'bg-rose-500 text-white',
    accent: 'text-rose-500',
    lightBg: 'bg-rose-50/50',
    emptyGradient: 'from-rose-100 to-rose-50',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
    ringStroke: 'stroke-rose-500',
  },
  skills: {
    icon: Brain,
    activeBtn: 'bg-indigo-600 text-white',
    accent: 'text-indigo-600',
    lightBg: 'bg-indigo-50/50',
    emptyGradient: 'from-indigo-100 to-indigo-50',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-600',
    ringStroke: 'stroke-indigo-600',
  },
  hobby: {
    icon: Palette,
    activeBtn: 'bg-sky-500 text-white',
    accent: 'text-sky-500',
    lightBg: 'bg-sky-50/50',
    emptyGradient: 'from-sky-100 to-sky-50',
    border: 'border-sky-200',
    dotColor: 'bg-sky-400',
    ringStroke: 'stroke-sky-400',
  },
};

export const PersonalGrowth = () => {
  const [activeCategory, setActiveCategory] = useState<GrowthCategory>('health');
  const [plans, setPlans] = useState<GrowthPlan[]>(() => {
    try {
      const raw = localStorage.getItem(GROWTH_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }, [plans]);

  const filteredPlans = plans.filter((p) => p.category === activeCategory);
  const totalPlans = plans.length;
  const completedSteps = plans.reduce((acc, p) => acc + p.executionSteps.filter(s => s.completed).length, 0);
  const totalSteps = plans.reduce((acc, p) => acc + p.executionSteps.length, 0);

  const handleAddPlan = (plan: Omit<GrowthPlan, 'id' | 'createdAt'>) => {
    const newPlan: GrowthPlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, newPlan]);
    setIsNewPlanModalOpen(false);
  };

  const handleUpdatePlan = (planId: string, updates: Partial<GrowthPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...updates } : p))
    );
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const categories: GrowthCategory[] = ['health', 'skills', 'hobby'];
  const activeConfig = CATEGORY_CONFIG[activeCategory];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-sky-200/25 rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <div className="relative px-6 pt-8 pb-6 border-b border-slate-200/50 bg-white/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg shadow-slate-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Personal Growth
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-[52px]">
            Build better habits. Track your progress. Achieve your goals.
          </p>
          
          {/* Quick Stats with visual enhancement */}
          <div className="flex gap-6 mt-6 ml-[52px]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                {totalPlans}
              </span>
              <span className="text-slate-500 text-sm">Plans</span>
            </div>
            <div className="w-px bg-slate-200 self-stretch" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">{completedSteps}</span>
              <span className="text-slate-500 text-sm">/ {totalSteps} Steps</span>
            </div>
            <div className="w-px bg-slate-200 self-stretch" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
                {totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%
              </span>
              <span className="text-slate-500 text-sm">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation with colored active states */}
      <div className="relative px-6 py-4 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const isActive = activeCategory === cat;
              const count = plans.filter((p) => p.category === cat).length;
              
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-semibold',
                    isActive
                      ? cn(config.activeBtn, 'shadow-lg')
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area with category-specific styling */}
      <ScrollArea className="flex-1 relative">
        <div className="px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Category-colored decorative line */}
            <motion.div 
              key={activeCategory + '-line'}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={cn(
                'h-1 rounded-full mb-6 origin-left',
                activeCategory === 'health' && 'bg-gradient-to-r from-rose-500 to-rose-300',
                activeCategory === 'skills' && 'bg-gradient-to-r from-indigo-600 to-indigo-400',
                activeCategory === 'hobby' && 'bg-gradient-to-r from-sky-500 to-sky-300'
              )}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {filteredPlans.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed relative overflow-hidden',
                      activeConfig.border,
                      'bg-gradient-to-br',
                      activeConfig.emptyGradient
                    )}
                  >
                    {/* Decorative sparkles */}
                    <Sparkles className={cn('absolute top-6 right-8 h-6 w-6 opacity-40', activeConfig.accent)} />
                    <Sparkles className={cn('absolute bottom-8 left-10 h-5 w-5 opacity-30', activeConfig.accent)} />
                    
                    <div className={cn(
                      'p-5 rounded-2xl mb-5 shadow-lg',
                      'bg-white border',
                      activeConfig.border
                    )}>
                      {(() => {
                        const Icon = activeConfig.icon;
                        return <Icon className={cn('h-10 w-10', activeConfig.accent)} />;
                      })()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      No {CATEGORY_LABELS[activeCategory]} Plans
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                      Start your journey by creating your first plan
                    </p>
                    <Button
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className={cn(
                        'gap-2 px-6 shadow-lg transition-transform hover:scale-105',
                        activeCategory === 'health' && 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
                        activeCategory === 'skills' && 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                        activeCategory === 'hobby' && 'bg-sky-500 hover:bg-sky-600 shadow-sky-200'
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Create Plan
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {/* Plans container with subtle background */}
                    <div className={cn(
                      'rounded-2xl p-4 space-y-4',
                      activeConfig.lightBg
                    )}>
                      {filteredPlans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <GrowthPlanCard
                            plan={plan}
                            onUpdate={(updates) => handleUpdatePlan(plan.id, updates)}
                            onDelete={() => handleDeletePlan(plan.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Add New Plan Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: filteredPlans.length * 0.05 }}
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className={cn(
                        'w-full py-4 rounded-xl border-2 border-dashed transition-all duration-200',
                        'flex items-center justify-center gap-2 text-sm font-semibold',
                        'hover:scale-[1.01]',
                        activeCategory === 'health' && 'border-rose-300 text-rose-500 hover:bg-rose-50',
                        activeCategory === 'skills' && 'border-indigo-300 text-indigo-600 hover:bg-indigo-50',
                        activeCategory === 'hobby' && 'border-sky-300 text-sky-500 hover:bg-sky-50'
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Plan
                    </motion.button>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          onClick={() => setIsNewPlanModalOpen(true)}
          className={cn(
            'h-14 w-14 rounded-full shadow-xl',
            activeCategory === 'health' && 'bg-rose-500 hover:bg-rose-600 shadow-rose-300',
            activeCategory === 'skills' && 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300',
            activeCategory === 'hobby' && 'bg-sky-500 hover:bg-sky-600 shadow-sky-300'
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* New Plan Modal */}
      <NewPlanModal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        onSave={handleAddPlan}
        defaultCategory={activeCategory}
      />
    </div>
  );
};
