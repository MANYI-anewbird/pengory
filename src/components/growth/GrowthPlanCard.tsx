import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Plus, 
  ExternalLink, 
  GripVertical,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
  Pencil,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GrowthPlan, ExecutionStep, LinkButton, CATEGORY_COLORS } from '@/types/growth';
import { cn } from '@/lib/utils';

interface GrowthPlanCardProps {
  plan: GrowthPlan;
  onUpdate: (updates: Partial<GrowthPlan>) => void;
  onDelete: () => void;
}

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
      className="bg-background rounded-xl border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-2 h-2 rounded-full', CATEGORY_COLORS[plan.category])} />
              <h3 className="font-semibold text-foreground truncate">{plan.goal}</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {plan.duration}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress ring */}
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  strokeWidth="3"
                  fill="none"
                  className="stroke-muted"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={100}
                  strokeDashoffset={100 - progress}
                  strokeLinecap="round"
                  className={cn(
                    'transition-all duration-300',
                    plan.category === 'health' && 'stroke-slate-700',
                    plan.category === 'skills' && 'stroke-teal-500',
                    plan.category === 'hobby' && 'stroke-sky-400'
                  )}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <button className="p-1 hover:bg-muted rounded">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
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
            <div className="px-4 pb-4 space-y-4 border-t">
              {/* Timeline */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start:</span>{' '}
                  <span className="font-medium">{plan.startDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">End:</span>{' '}
                  <span className="font-medium">{plan.endDate}</span>
                </div>
              </div>

              {/* Execution Steps */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Execution Steps
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
                        'bg-muted/50 rounded-lg p-3 cursor-grab active:cursor-grabbing',
                        draggedLink && 'ring-2 ring-primary/30'
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(step.id)}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleToggleStep(step.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'text-sm',
                              step.completed && 'line-through text-muted-foreground'
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
                                  className="group flex items-center gap-1 bg-background border rounded-md px-2 py-1 text-xs cursor-move hover:border-primary/50 transition-colors"
                                >
                                  <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.title}
                                  </a>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  <button
                                    onClick={() => handleDeleteLink(step.id, link.id)}
                                    className="opacity-0 group-hover:opacity-100 ml-1 text-destructive hover:text-destructive/80"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add link form */}
                          {addingLinkToStep === step.id ? (
                            <div className="mt-2 space-y-2">
                              <Input
                                placeholder="Link URL (e.g., bilibili.com/...)"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                className="h-8 text-xs"
                              />
                              <Input
                                placeholder="Button title (optional)"
                                value={newLinkTitle}
                                onChange={(e) => setNewLinkTitle(e.target.value)}
                                className="h-8 text-xs"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddLink(step.id)}
                                  className="h-7 text-xs"
                                >
                                  Add
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setAddingLinkToStep(null);
                                    setNewLinkUrl('');
                                    setNewLinkTitle('');
                                  }}
                                  className="h-7 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingLinkToStep(step.id)}
                              className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add link
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
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
                    placeholder="Add a new step..."
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleAddStep} className="h-9">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
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
                    className="p-1 text-muted-foreground hover:text-primary rounded"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingNotes ? (
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Add notes..."
                    className="text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 min-h-[40px]">
                    {plan.notes || 'No notes yet'}
                  </p>
                )}
              </div>

              {/* Expected Result */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
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
                    className="p-1 text-muted-foreground hover:text-primary rounded"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {editingResult ? (
                  <Textarea
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    placeholder="What do you want to achieve?"
                    className="text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 min-h-[40px]">
                    {plan.expectedResult || 'No expected result set'}
                  </p>
                )}
              </div>

              {/* Delete Plan */}
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
