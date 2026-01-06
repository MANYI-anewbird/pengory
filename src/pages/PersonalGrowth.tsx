import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Sparkles, Target, Trash2, FolderPlus, Archive, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthPlan, GrowthCategory, CustomCategory, DEFAULT_CATEGORIES } from '@/types/growth';
import { GrowthPlanCard } from '@/components/growth/GrowthPlanCard';
import { NewPlanModal } from '@/components/growth/NewPlanModal';
import { NewCategoryModal } from '@/components/growth/NewCategoryModal';
import { cn } from '@/lib/utils';

const GROWTH_STORAGE_KEY = 'pompom_growth_plans_v1';
const CATEGORIES_STORAGE_KEY = 'pompom_growth_categories_v1';


export const PersonalGrowth = () => {
  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES;
      
      // Update default categories with new colors if they exist
      const defaultColorMap: Record<string, string> = {};
      DEFAULT_CATEGORIES.forEach(dc => { defaultColorMap[dc.id] = dc.color; });
      
      return parsed.map(cat => {
        if (defaultColorMap[cat.id]) {
          return { ...cat, color: defaultColorMap[cat.id] };
        }
        return cat;
      });
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<GrowthCategory>(() => categories[0]?.id || 'health');
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
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  const activeConfig = useMemo(() => {
    const cat = categories.find(c => c.id === activeCategory);
    return cat || categories[0] || DEFAULT_CATEGORIES[0];
  }, [categories, activeCategory]);

  const [showArchived, setShowArchived] = useState(false);

  // Separate active and archived plans
  const isCompleted = (plan: GrowthPlan) => 
    plan.executionSteps.length > 0 && plan.executionSteps.every(s => s.completed);

  const filteredPlans = plans.filter((p) => p.category === activeCategory && !isCompleted(p));
  const archivedPlans = plans.filter((p) => p.category === activeCategory && isCompleted(p));
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

  const handleAddCategory = (categoryData: Omit<CustomCategory, 'id'>) => {
    const newCategory: CustomCategory = {
      ...categoryData,
      id: `custom_${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
    setActiveCategory(newCategory.id);
    setIsNewCategoryModalOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Don't allow deleting if it's the last category
    if (categories.length <= 1) return;
    
    setCategories((prev) => prev.filter(c => c.id !== categoryId));
    // Also delete plans in this category
    setPlans((prev) => prev.filter(p => p.category !== categoryId));
    
    // Switch to first available category
    if (activeCategory === categoryId) {
      const remaining = categories.filter(c => c.id !== categoryId);
      setActiveCategory(remaining[0]?.id || 'health');
    }
  };

  const isDefaultCategory = (id: string) => ['health', 'skills', 'hobby'].includes(id);

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
                  <span className="text-sm font-bold" style={{ color: activeConfig.color }}>{progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: activeConfig.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Stats */}
          <ScrollArea className="flex-1 max-h-64">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">By Category</span>
              {categories.map((cat) => {
                const catPlans = plans.filter(p => p.category === cat.id);
                const catSteps = catPlans.reduce((acc, p) => acc + p.executionSteps.length, 0);
                const catCompleted = catPlans.reduce((acc, p) => acc + p.executionSteps.filter(s => s.completed).length, 0);
                const catProgress = catSteps > 0 ? Math.round((catCompleted / catSteps) * 100) : 0;
                
                return (
                  <div 
                    key={cat.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all cursor-pointer group relative',
                      activeCategory === cat.id 
                        ? 'border-transparent text-white shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                    style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          activeCategory === cat.id ? 'bg-white/25' : 'bg-slate-100'
                        )}>
                          {catPlans.length}
                        </span>
                        {!isDefaultCategory(cat.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat.id);
                            }}
                            className={cn(
                              'opacity-0 group-hover:opacity-100 p-1 rounded transition-all',
                              activeCategory === cat.id 
                                ? 'hover:bg-white/20' 
                                : 'hover:bg-red-50 text-red-400'
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {catSteps > 0 && (
                      <div className="mt-2">
                        <div className={cn(
                          'h-1 rounded-full overflow-hidden',
                          activeCategory === cat.id ? 'bg-white/30' : 'bg-slate-100'
                        )}>
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${catProgress}%`,
                              backgroundColor: activeCategory === cat.id ? 'white' : cat.color
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Add Category Button */}
        <div className="mt-auto p-4 border-t border-slate-100">
          <Button
            onClick={() => setIsNewCategoryModalOpen(true)}
            variant="outline"
            className="w-full gap-2 border-dashed"
          >
            <FolderPlus className="h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeConfig.name}</h2>
              <p className="text-xs text-slate-500">{filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsNewPlanModalOpen(true)}
            size="sm"
            className="gap-1.5 text-white"
            style={{ backgroundColor: activeConfig.color }}
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
          className="h-1 origin-left"
          style={{ backgroundColor: activeConfig.color }}
        />

        {/* Plans Content */}
        <ScrollArea className="flex-1">
          <div 
            className="p-6 min-h-full"
            style={{ backgroundColor: `${activeConfig.color}10` }}
          >
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
                    className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed relative overflow-hidden"
                    style={{ 
                      borderColor: `${activeConfig.color}50`,
                      background: `linear-gradient(to bottom right, ${activeConfig.color}20, ${activeConfig.color}05)`
                    }}
                  >
                    <Sparkles 
                      className="absolute top-6 right-8 h-6 w-6 opacity-40" 
                      style={{ color: activeConfig.color }}
                    />
                    <Sparkles 
                      className="absolute bottom-8 left-10 h-5 w-5 opacity-30" 
                      style={{ color: activeConfig.color }}
                    />
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      No {activeConfig.name} Plans
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                      Start your journey by creating your first plan
                    </p>
                    <Button
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className="gap-2 px-6 shadow-lg text-white"
                      style={{ backgroundColor: activeConfig.color }}
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
                          customColor={activeConfig.color}
                        />
                      </motion.div>
                    ))}
                    
                    {/* Add More Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: filteredPlans.length * 0.05 }}
                      onClick={() => setIsNewPlanModalOpen(true)}
                      className="w-full py-4 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.01] bg-white/50"
                      style={{ 
                        borderColor: `${activeConfig.color}50`,
                        color: activeConfig.color
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Plan
                    </motion.button>
                  </div>
                )}

                {/* Archived Section */}
                {archivedPlans.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8"
                  >
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-200 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${activeConfig.color}20` }}
                        >
                          <Archive className="h-4 w-4" style={{ color: activeConfig.color }} />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-semibold text-slate-700">Archived</span>
                          <p className="text-xs text-slate-500">
                            {archivedPlans.length} mastered skill{archivedPlans.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        {showArchived ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {showArchived && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-4 mt-4">
                            {archivedPlans.map((plan, index) => (
                              <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                              >
                                <div className="absolute -top-2 -right-2 z-10 bg-amber-400 text-white p-1.5 rounded-full shadow-lg">
                                  <Trophy className="h-3.5 w-3.5" />
                                </div>
                                <GrowthPlanCard
                                  plan={plan}
                                  onUpdate={(updates) => handleUpdatePlan(plan.id, updates)}
                                  onDelete={() => handleDeletePlan(plan.id)}
                                  customColor={activeConfig.color}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
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
          className="h-14 w-14 rounded-full shadow-xl text-white"
          style={{ backgroundColor: activeConfig.color }}
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

      {/* New Category Modal */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onSave={handleAddCategory}
        existingNames={categories.map(c => c.name)}
      />
    </div>
  );
};
