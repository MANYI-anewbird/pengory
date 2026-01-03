import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Brain, Palette, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthPlan, GrowthCategory, CATEGORY_LABELS } from '@/types/growth';
import { GrowthPlanCard } from '@/components/growth/GrowthPlanCard';
import { NewPlanModal } from '@/components/growth/NewPlanModal';
import { cn } from '@/lib/utils';

const GROWTH_STORAGE_KEY = 'pompom_growth_plans_v1';

const CATEGORY_CONFIG: Record<GrowthCategory, {
  icon: any;
  color: string;
  lightBg: string;
  border: string;
}> = {
  health: {
    icon: Heart,
    color: 'text-slate-700',
    lightBg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  skills: {
    icon: Brain,
    color: 'text-teal-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  hobby: {
    icon: Palette,
    color: 'text-sky-500',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
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
    <div className="flex-1 flex flex-col overflow-hidden bg-white min-h-screen">
      {/* Hero Header */}
      <div className="px-6 pt-8 pb-6 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Personal Growth
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">
            Build better habits. Track your progress. Achieve your goals.
          </p>
          
          {/* Quick Stats */}
          {totalPlans > 0 && (
            <div className="flex gap-6 mt-6 ml-12">
              <div>
                <span className="text-2xl font-bold text-slate-900">{totalPlans}</span>
                <span className="text-slate-500 text-sm ml-1.5">Plans</span>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <span className="text-2xl font-bold text-slate-900">{completedSteps}</span>
                <span className="text-slate-500 text-sm ml-1.5">/ {totalSteps} Steps</span>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%
                </span>
                <span className="text-slate-500 text-sm ml-1.5">Complete</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const isActive = activeCategory === cat;
              const count = plans.filter((p) => p.category === cat).length;
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                    isActive
                      ? cn('bg-slate-900 text-white shadow-md')
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {filteredPlans.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed',
                      activeConfig.border,
                      activeConfig.lightBg
                    )}
                  >
                    <div className={cn(
                      'p-4 rounded-2xl mb-5',
                      'bg-white shadow-sm border',
                      activeConfig.border
                    )}>
                      {(() => {
                        const Icon = activeConfig.icon;
                        return <Icon className={cn('h-8 w-8', activeConfig.color)} />;
                      })()}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No {CATEGORY_LABELS[activeCategory]} Plans
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                      Start your journey by creating your first plan in this category
                    </p>
                    <Button
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className="gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6"
                    >
                      <Plus className="h-4 w-4" />
                      Create Plan
                    </Button>
                  </motion.div>
                ) : (
                  <>
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
                    
                    {/* Add New Plan Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: filteredPlans.length * 0.05 }}
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className={cn(
                        'w-full py-4 rounded-xl border-2 border-dashed transition-all duration-200',
                        'flex items-center justify-center gap-2 text-sm font-medium',
                        'hover:border-slate-400 hover:bg-slate-50',
                        'border-slate-200 text-slate-500'
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
          className="h-14 w-14 rounded-full shadow-lg bg-slate-900 hover:bg-slate-800"
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
