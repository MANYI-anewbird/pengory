import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Brain, Palette, TrendingUp, Sparkles, Target, CheckCircle2 } from 'lucide-react';
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
  activeBtn: string;
  accent: string;
  lightBg: string;
  emptyGradient: string;
  border: string;
  dotColor: string;
  ringStroke: string;
  gradient: string;
}> = {
  health: {
    icon: Heart,
    activeBtn: 'bg-[#e8b4b8] text-white',
    accent: 'text-[#e8b4b8]',
    lightBg: 'bg-[#e8b4b8]/10',
    emptyGradient: 'from-[#e8b4b8]/20 to-[#e8b4b8]/5',
    border: 'border-[#e8b4b8]/30',
    dotColor: 'bg-[#e8b4b8]',
    ringStroke: 'stroke-[#e8b4b8]',
    gradient: 'from-[#e8b4b8] to-[#e8b4b8]',
  },
  skills: {
    icon: Brain,
    activeBtn: 'bg-[#4a2c6a] text-white',
    accent: 'text-[#4a2c6a]',
    lightBg: 'bg-[#4a2c6a]/10',
    emptyGradient: 'from-[#4a2c6a]/20 to-[#4a2c6a]/5',
    border: 'border-[#4a2c6a]/30',
    dotColor: 'bg-[#4a2c6a]',
    ringStroke: 'stroke-[#4a2c6a]',
    gradient: 'from-[#4a2c6a] to-[#4a2c6a]',
  },
  hobby: {
    icon: Palette,
    activeBtn: 'bg-[#6bc4e8] text-white',
    accent: 'text-[#6bc4e8]',
    lightBg: 'bg-[#6bc4e8]/10',
    emptyGradient: 'from-[#6bc4e8]/20 to-[#6bc4e8]/5',
    border: 'border-[#6bc4e8]/30',
    dotColor: 'bg-[#6bc4e8]',
    ringStroke: 'stroke-[#6bc4e8]',
    gradient: 'from-[#6bc4e8] to-[#6bc4e8]',
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
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

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
    <div className="flex-1 flex overflow-hidden bg-slate-50 min-h-screen">
      {/* Left Sidebar - Dashboard */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Personal Growth</h1>
              <p className="text-xs text-slate-500">Track your goals</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overview</span>
              <Target className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Plans</span>
                <span className="text-xl font-bold text-slate-900">{totalPlans}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Steps Done</span>
                <span className="text-sm font-semibold text-slate-700">{completedSteps}/{totalSteps}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Stats */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">By Category</span>
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const catPlans = plans.filter(p => p.category === cat);
              const catSteps = catPlans.reduce((acc, p) => acc + p.executionSteps.length, 0);
              const catCompleted = catPlans.reduce((acc, p) => acc + p.executionSteps.filter(s => s.completed).length, 0);
              const catProgress = catSteps > 0 ? Math.round((catCompleted / catSteps) * 100) : 0;
              
              return (
                <div 
                  key={cat}
                  className={cn(
                    'p-3 rounded-lg border transition-all cursor-pointer',
                    activeCategory === cat 
                      ? cn('bg-gradient-to-r', config.gradient, 'border-transparent text-white shadow-md')
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  )}
                  onClick={() => setActiveCategory(cat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        activeCategory === cat ? 'bg-white/25' : 'bg-slate-100'
                      )}>
                        {catPlans.length}
                      </span>
                    </div>
                  </div>
                  {catSteps > 0 && (
                    <div className="mt-2">
                      <div className={cn(
                        'h-1 rounded-full overflow-hidden',
                        activeCategory === cat ? 'bg-white/30' : 'bg-slate-100'
                      )}>
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            activeCategory === cat ? 'bg-white' : config.dotColor
                          )}
                          style={{ width: `${catProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Plan Button */}
        <div className="mt-auto p-4 border-t border-slate-100">
          <Button
            onClick={() => setIsNewPlanModalOpen(true)}
            className={cn(
              'w-full gap-2 shadow-md transition-transform hover:scale-[1.02]',
              'bg-gradient-to-r',
              activeConfig.gradient
            )}
          >
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = activeConfig.icon;
              return (
                <div className={cn('p-2 rounded-lg bg-gradient-to-r', activeConfig.gradient)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              );
            })()}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{CATEGORY_LABELS[activeCategory]}</h2>
              <p className="text-xs text-slate-500">{filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsNewPlanModalOpen(true)}
            size="sm"
            className={cn('gap-1.5 bg-gradient-to-r', activeConfig.gradient)}
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </Button>
        </div>

        {/* Colored accent line */}
        <motion.div 
          key={activeCategory + '-line'}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className={cn('h-1 origin-left bg-gradient-to-r', activeConfig.gradient)}
        />

        {/* Plans Content */}
        <ScrollArea className="flex-1">
          <div className={cn('p-6 min-h-full', activeConfig.lightBg)}>
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
                      'flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed relative overflow-hidden',
                      activeConfig.border,
                      'bg-gradient-to-br',
                      activeConfig.emptyGradient
                    )}
                  >
                    <Sparkles className={cn('absolute top-6 right-8 h-6 w-6 opacity-40', activeConfig.accent)} />
                    <Sparkles className={cn('absolute bottom-8 left-10 h-5 w-5 opacity-30', activeConfig.accent)} />
                    
                    <div className={cn(
                      'p-5 rounded-2xl mb-5 shadow-lg bg-white border',
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
                      className={cn('gap-2 px-6 shadow-lg bg-gradient-to-r', activeConfig.gradient)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Plan
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid gap-4">
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
                    
                    {/* Add More Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: filteredPlans.length * 0.05 }}
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className={cn(
                        'w-full py-4 rounded-xl border-2 border-dashed transition-all duration-200',
                        'flex items-center justify-center gap-2 text-sm font-semibold',
                        'hover:scale-[1.01] bg-white/50',
                        activeConfig.border,
                        activeConfig.accent
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Plan
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={() => setIsNewPlanModalOpen(true)}
          className={cn('h-14 w-14 rounded-full shadow-xl bg-gradient-to-r', activeConfig.gradient)}
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
