import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ChevronDown, 
  Trash2, 
  Plus, 
  GripVertical,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
  Pencil,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GrowthPlan, ExecutionStep } from '@/types/growth';
import { cn } from '@/lib/utils';

interface GrowthPlanCardProps {
  plan: GrowthPlan;
  onUpdate: (updates: Partial<GrowthPlan>) => void;
  onDelete: () => void;
  customColor?: string;
}

const CATEGORY_STYLES = {
  health: {
    dot: 'bg-[#f472b6]',
    ring: 'stroke-[#f472b6]',
    accent: 'text-[#f472b6]',
    accentBg: 'bg-[#f472b6]',
    lightBg: 'bg-[#f472b6]/10',
    border: 'border-[#f472b6]/30',
  },
  skills: {
    dot: 'bg-[#8b5cf6]',
    ring: 'stroke-[#8b5cf6]',
    accent: 'text-[#8b5cf6]',
    accentBg: 'bg-[#8b5cf6]',
    lightBg: 'bg-[#8b5cf6]/10',
    border: 'border-[#8b5cf6]/30',
  },
  hobby: {
    dot: 'bg-[#38bdf8]',
    ring: 'stroke-[#38bdf8]',
    accent: 'text-[#38bdf8]',
    accentBg: 'bg-[#38bdf8]',
    lightBg: 'bg-[#38bdf8]/10',
    border: 'border-[#38bdf8]/30',
  },
};

const DEFAULT_STYLE = {
  dot: 'bg-slate-500',
  ring: 'stroke-slate-500',
  accent: 'text-slate-500',
  accentBg: 'bg-slate-500',
  lightBg: 'bg-slate-50',
  border: 'border-slate-200',
};

export const GrowthPlanCard = ({ plan, onUpdate, onDelete, customColor }: GrowthPlanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingResult, setEditingResult] = useState(false);
  const [notesValue, setNotesValue] = useState(plan.notes);
  const [resultValue, setResultValue] = useState(plan.expectedResult);

  const completedSteps = plan.executionSteps.filter((s) => s.completed).length;
  const totalSteps = plan.executionSteps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  // Use customColor if provided, otherwise fall back to predefined styles
  const styles = customColor ? null : (CATEGORY_STYLES[plan.category as keyof typeof CATEGORY_STYLES] || DEFAULT_STYLE);
  const color = customColor || '#64748b';

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: ExecutionStep = {
      id: Date.now().toString(),
      title: newStepTitle.trim(),
      completed: false,
      links: [], // Keep for backward compatibility but not used in UI
    };
    onUpdate({
      executionSteps: [...plan.executionSteps, newStep],
    });
    setNewStepTitle('');
  };

  const handleToggleStep = (stepId: string) => {
    onUpdate({
      executionSteps: plan.executionSteps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleDeleteStep = (stepId: string) => {
    onUpdate({
      executionSteps: plan.executionSteps.filter((s) => s.id !== stepId),
    });
  };

  const handleReorderSteps = (newOrder: ExecutionStep[]) => {
    onUpdate({ executionSteps: newOrder });
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
      style={customColor ? { borderColor: `${color}30` } : {}}
    >
      {/* Colored top accent bar */}
      <div 
        className="h-1"
        style={{ backgroundColor: color }}
      />
      
      {/* Header */}
      <div
        className="p-5 cursor-pointer transition-colors hover:bg-slate-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
              />
              <h3 className="font-bold text-slate-900 text-base truncate">{plan.goal}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 ml-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {plan.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Progress Display */}
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    strokeWidth="4"
                    fill="none"
                    className="stroke-slate-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (progress / 100) * 125.6}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{ stroke: color }}
                  />
                </svg>
                <span 
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div 
              className="px-5 pb-5 space-y-5 border-t"
              style={{ borderColor: `${color}30` }}
            >
              {/* Timeline */}
              <div className="pt-5 flex gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>Start</span>
                  <span 
                    className="font-medium text-slate-700 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {plan.startDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>End</span>
                  <span 
                    className="font-medium text-slate-700 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {plan.endDate}
                  </span>
                </div>
              </div>

              <div>
                <h4 
                  className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2"
                  style={{ color }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Steps
                </h4>
                <Reorder.Group
                  axis="y"
                  values={plan.executionSteps}
                  onReorder={handleReorderSteps}
                  className="space-y-1.5"
                >
                  {plan.executionSteps.map((step) => (
                    <Reorder.Item
                      key={step.id}
                      value={step}
                      className="rounded-lg p-2 cursor-grab active:cursor-grabbing border border-transparent transition-all"
                      style={{ 
                        backgroundColor: `${color}10`,
                        borderColor: 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                        
                        {/* Custom Checkbox */}
                        <button
                          onClick={() => handleToggleStep(step.id)}
                          className="h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={step.completed ? { 
                            backgroundColor: color, 
                            borderColor: color 
                          } : { 
                            borderColor: '#cbd5e1',
                            backgroundColor: 'white'
                          }}
                        >
                          {step.completed && <Check className="h-2.5 w-2.5 text-white" />}
                        </button>
                        
                        <span
                          className={cn(
                            'text-sm font-medium flex-1 min-w-0',
                            step.completed ? 'line-through text-slate-400' : 'text-slate-700'
                          )}
                        >
                          {step.title}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {/* Add new step */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a step..."
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                    className="h-9 text-sm bg-white"
                    style={{ borderColor: `${color}30` }}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddStep} 
                    className="h-9 px-3 text-white hover:opacity-90"
                    style={{ backgroundColor: color }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expected Result */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 
                    className="text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                    style={{ color }}
                  >
                    <Target className="h-4 w-4" />
                    Expected Result
                  </h4>
                  <button
                    onClick={() => {
                      if (editingResult) {
                        onUpdate({ expectedResult: resultValue });
                      }
                      setEditingResult(!editingResult);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                    style={{ color }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingResult ? (
                  <Textarea
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    placeholder="What do you want to achieve?"
                    className="text-sm bg-white"
                    style={{ borderColor: `${color}30` }}
                    rows={3}
                  />
                ) : (
                  <p 
                    className="text-sm text-slate-600 rounded-lg p-3 min-h-[48px]"
                    style={{ backgroundColor: `${color}10` }}
                  >
                    {plan.expectedResult || 'No expected result set'}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 
                    className="text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                    style={{ color }}
                  >
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <button
                    onClick={() => {
                      if (editingNotes) {
                        onUpdate({ notes: notesValue });
                      }
                      setEditingNotes(!editingNotes);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                    style={{ color }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingNotes ? (
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Add notes..."
                    className="text-sm bg-white"
                    style={{ borderColor: `${color}30` }}
                    rows={3}
                  />
                ) : (
                  <p 
                    className="text-sm text-slate-600 rounded-lg p-3 min-h-[48px]"
                    style={{ backgroundColor: `${color}10` }}
                  >
                    {plan.notes || 'No notes yet'}
                  </p>
                )}
              </div>

              {/* Delete Plan */}
              <div 
                className="pt-3 border-t"
                style={{ borderColor: `${color}30` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
