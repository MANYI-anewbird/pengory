import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Brain, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthPlan, GrowthCategory, CATEGORY_LABELS } from '@/types/growth';
import { GrowthPlanCard } from '@/components/growth/GrowthPlanCard';
import { NewPlanModal } from '@/components/growth/NewPlanModal';
import { cn } from '@/lib/utils';

const GROWTH_STORAGE_KEY = 'pompom_growth_plans_v1';

const CATEGORY_ICONS: Record<GrowthCategory, any> = {
  health: Heart,
  skills: Brain,
  hobby: Palette,
};

const CATEGORY_BG: Record<GrowthCategory, string> = {
  health: 'from-slate-500/10 to-slate-500/5',
  skills: 'from-slate-500/10 to-slate-500/5',
  hobby: 'from-slate-500/10 to-slate-500/5',
};

const CATEGORY_ACCENT: Record<GrowthCategory, string> = {
  health: 'text-slate-700 bg-slate-100',
  skills: 'text-slate-700 bg-slate-100',
  hobby: 'text-slate-700 bg-slate-100',
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Personal Growth</h1>
        <p className="text-sm text-muted-foreground">Track your goals and grow every day</p>
      </div>

      {/* Category Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = activeCategory === cat;
            const count = plans.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{CATEGORY_LABELS[cat]}</span>
                {count > 0 && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-white/20' : 'bg-muted'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className={cn('flex-1 px-6 pb-6')}>
        <div className={cn('min-h-full rounded-2xl bg-gradient-to-b p-4', CATEGORY_BG[activeCategory])}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={cn('p-4 rounded-full mb-4', CATEGORY_ACCENT[activeCategory])}>
                    {(() => {
                      const Icon = CATEGORY_ICONS[activeCategory];
                      return <Icon className="h-8 w-8" />;
                    })()}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No plans yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your {CATEGORY_LABELS[activeCategory].toLowerCase()} journey
                  </p>
                  <Button
                    onClick={() => setIsNewPlanModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Plan
                  </Button>
                </div>
              ) : (
                <>
                  {filteredPlans.map((plan) => (
                    <GrowthPlanCard
                      key={plan.id}
                      plan={plan}
                      onUpdate={(updates) => handleUpdatePlan(plan.id, updates)}
                      onDelete={() => handleDeletePlan(plan.id)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setIsNewPlanModalOpen(true)}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Plan
                  </Button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

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
