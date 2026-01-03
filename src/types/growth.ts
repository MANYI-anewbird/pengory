export type GrowthCategory = 'health' | 'skills' | 'language' | 'hobby';

export interface LinkButton {
  id: string;
  title: string;
  url: string;
}

export interface ExecutionStep {
  id: string;
  title: string;
  completed: boolean;
  links: LinkButton[];
}

export interface GrowthPlan {
  id: string;
  category: GrowthCategory;
  goal: string;
  duration: string;
  startDate: string;
  endDate: string;
  executionSteps: ExecutionStep[];
  notes: string;
  expectedResult: string;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<GrowthCategory, string> = {
  health: 'Health & Fitness',
  skills: 'Skills Learning',
  language: 'Language Growth',
  hobby: 'Hobby Development',
};

export const CATEGORY_COLORS: Record<GrowthCategory, string> = {
  health: 'bg-rose-500',
  skills: 'bg-blue-500',
  language: 'bg-emerald-500',
  hobby: 'bg-amber-500',
};
