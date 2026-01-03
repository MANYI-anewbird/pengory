import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ChevronDown, 
  Trash2, 
  Plus, 
  ExternalLink, 
  GripVertical,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
  Pencil,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GrowthPlan, ExecutionStep, LinkButton } from '@/types/growth';
import { cn } from '@/lib/utils';

interface GrowthPlanCardProps {
  plan: GrowthPlan;
  onUpdate: (updates: Partial<GrowthPlan>) => void;
  onDelete: () => void;
}

const CATEGORY_STYLES = {
  health: {
    dot: 'bg-pink-300',
    ring: 'stroke-pink-300',
    accent: 'text-pink-400',
    accentBg: 'bg-pink-300',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  skills: {
    dot: 'bg-indigo-600',
    ring: 'stroke-indigo-600',
    accent: 'text-indigo-600',
    accentBg: 'bg-indigo-600',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  hobby: {
    dot: 'bg-sky-400',
    ring: 'stroke-sky-400',
    accent: 'text-sky-500',
    accentBg: 'bg-sky-500',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
  },
};

export const GrowthPlanCard = ({ plan, onUpdate, onDelete }: GrowthPlanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [addingLinkToStep, setAddingLinkToStep] = useState<string | null>(null);
  const [draggedLink, setDraggedLink] = useState<LinkButton | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingResult, setEditingResult] = useState(false);
  const [notesValue, setNotesValue] = useState(plan.notes);
  const [resultValue, setResultValue] = useState(plan.expectedResult);

  const completedSteps = plan.executionSteps.filter((s) => s.completed).length;
  const totalSteps = plan.executionSteps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const styles = CATEGORY_STYLES[plan.category];

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: ExecutionStep = {
      id: Date.now().toString(),
      title: newStepTitle.trim(),
      completed: false,
      links: [],
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

  const handleAddLink = (stepId: string) => {
    if (!newLinkUrl.trim()) return;
    const title = newLinkTitle.trim() || extractDomain(newLinkUrl);
    const newLink: LinkButton = {
      id: Date.now().toString(),
      title,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
    };
    onUpdate({
      executionSteps: plan.executionSteps.map((s) =>
        s.id === stepId ? { ...s, links: [...s.links, newLink] } : s
      ),
    });
    setNewLinkUrl('');
    setNewLinkTitle('');
    setAddingLinkToStep(null);
  };

  const handleDeleteLink = (stepId: string, linkId: string) => {
    onUpdate({
      executionSteps: plan.executionSteps.map((s) =>
        s.id === stepId ? { ...s, links: s.links.filter((l) => l.id !== linkId) } : s
      ),
    });
  };

  const handleDragStart = (link: LinkButton, sourceStepId: string) => {
    setDraggedLink({ ...link, id: `${sourceStepId}:${link.id}` });
  };

  const handleDrop = (targetStepId: string) => {
    if (!draggedLink) return;
    const [sourceStepId, linkId] = draggedLink.id.split(':');
    if (sourceStepId === targetStepId) {
      setDraggedLink(null);
      return;
    }
    
    const sourceStep = plan.executionSteps.find((s) => s.id === sourceStepId);
    const linkToMove = sourceStep?.links.find((l) => l.id === linkId);
    
    if (!linkToMove) {
      setDraggedLink(null);
      return;
    }

    onUpdate({
      executionSteps: plan.executionSteps.map((s) => {
        if (s.id === sourceStepId) {
          return { ...s, links: s.links.filter((l) => l.id !== linkId) };
        }
        if (s.id === targetStepId) {
          return { ...s, links: [...s.links, { ...linkToMove, id: Date.now().toString() }] };
        }
        return s;
      }),
    });
    setDraggedLink(null);
  };

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  const handleReorderSteps = (newOrder: ExecutionStep[]) => {
    onUpdate({ executionSteps: newOrder });
  };

  return (
    <motion.div
      layout
      className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300',
        styles.border
      )}
    >
      {/* Colored top accent bar */}
      <div className={cn('h-1', styles.accentBg)} />
      
      {/* Header */}
      <div
        className="p-5 cursor-pointer transition-colors hover:bg-slate-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('w-3 h-3 rounded-full shadow-sm', styles.dot)} />
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
                    className={cn('transition-all duration-500', styles.ring)}
                  />
                </svg>
                <span className={cn('absolute inset-0 flex items-center justify-center text-sm font-bold', styles.accent)}>
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
            <div className={cn('px-5 pb-5 space-y-5 border-t', styles.border)}>
              {/* Timeline */}
              <div className="pt-5 flex gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', styles.accent)}>Start</span>
                  <span className={cn('font-medium text-slate-700 px-3 py-1.5 rounded-lg', styles.lightBg)}>
                    {plan.startDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', styles.accent)}>End</span>
                  <span className={cn('font-medium text-slate-700 px-3 py-1.5 rounded-lg', styles.lightBg)}>
                    {plan.endDate}
                  </span>
                </div>
              </div>

              {/* Execution Steps */}
              <div>
                <h4 className={cn('text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2', styles.accent)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Steps
                </h4>
                <Reorder.Group
                  axis="y"
                  values={plan.executionSteps}
                  onReorder={handleReorderSteps}
                  className="space-y-2"
                >
                  {plan.executionSteps.map((step) => (
                    <Reorder.Item
                      key={step.id}
                      value={step}
                      className={cn(
                        'rounded-lg p-3 cursor-grab active:cursor-grabbing border border-transparent transition-all',
                        styles.lightBg,
                        draggedLink && styles.border
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(step.id)}
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                        
                        {/* Custom Checkbox */}
                        <button
                          onClick={() => handleToggleStep(step.id)}
                          className={cn(
                            'h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5',
                            step.completed 
                              ? cn(styles.accentBg, styles.border)
                              : cn('border-slate-300 hover:border-slate-400 bg-white')
                          )}
                        >
                          {step.completed && <Check className="h-3 w-3 text-white" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              step.completed ? 'line-through text-slate-400' : 'text-slate-700'
                            )}
                          >
                            {step.title}
                          </span>
                          
                          {/* Links for this step */}
                          {step.links.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {step.links.map((link) => (
                                <div
                                  key={link.id}
                                  draggable
                                  onDragStart={() => handleDragStart(link, step.id)}
                                  className={cn(
                                    'group flex items-center gap-1.5 bg-white border rounded-md px-2 py-1 text-xs cursor-move transition-colors',
                                    styles.border,
                                    'hover:shadow-sm'
                                  )}
                                >
                                  <LinkIcon className={cn('h-3 w-3', styles.accent)} />
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn('hover:underline', styles.accent)}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.title}
                                  </a>
                                  <ExternalLink className="h-3 w-3 text-slate-400" />
                                  <button
                                    onClick={() => handleDeleteLink(step.id, link.id)}
                                    className="opacity-0 group-hover:opacity-100 ml-0.5 text-slate-400 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add link form */}
                          {addingLinkToStep === step.id ? (
                            <div className="mt-3 space-y-2">
                              <Input
                                placeholder="URL"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                className={cn('h-8 text-sm bg-white', styles.border)}
                              />
                              <Input
                                placeholder="Title (optional)"
                                value={newLinkTitle}
                                onChange={(e) => setNewLinkTitle(e.target.value)}
                                className={cn('h-8 text-sm bg-white', styles.border)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddLink(step.id)}
                                  className={cn('h-7 text-xs', styles.accentBg, 'hover:opacity-90')}
                                >
                                  Add Link
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setAddingLinkToStep(null);
                                    setNewLinkUrl('');
                                    setNewLinkTitle('');
                                  }}
                                  className="h-7 text-xs text-slate-500"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingLinkToStep(step.id)}
                              className={cn('mt-2 text-xs flex items-center gap-1 opacity-60 hover:opacity-100', styles.accent)}
                            >
                              <Plus className="h-3 w-3" />
                              Add link
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {/* Add new step */}
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Add a step..."
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                    className={cn('h-10 text-sm bg-white', styles.border)}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddStep} 
                    className={cn('h-10 px-4', styles.accentBg, 'hover:opacity-90')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={cn('text-xs font-bold uppercase tracking-wide flex items-center gap-2', styles.accent)}>
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
                    className={cn('p-1.5 hover:bg-slate-100 rounded-md transition-colors', styles.accent)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingNotes ? (
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Add notes..."
                    className={cn('text-sm bg-white', styles.border)}
                    rows={3}
                  />
                ) : (
                  <p className={cn('text-sm text-slate-600 rounded-lg p-3 min-h-[48px]', styles.lightBg)}>
                    {plan.notes || 'No notes yet'}
                  </p>
                )}
              </div>

              {/* Expected Result */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={cn('text-xs font-bold uppercase tracking-wide flex items-center gap-2', styles.accent)}>
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
                    className={cn('p-1.5 hover:bg-slate-100 rounded-md transition-colors', styles.accent)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingResult ? (
                  <Textarea
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    placeholder="What do you want to achieve?"
                    className={cn('text-sm bg-white', styles.border)}
                    rows={3}
                  />
                ) : (
                  <p className={cn('text-sm text-slate-600 rounded-lg p-3 min-h-[48px]', styles.lightBg)}>
                    {plan.expectedResult || 'No expected result set'}
                  </p>
                )}
              </div>

              {/* Delete Plan */}
              <div className={cn('pt-3 border-t', styles.border)}>
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
