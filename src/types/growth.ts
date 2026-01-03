export type GrowthCategory = string;

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

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

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'health', name: 'Health & Fitness', color: '#f472b6' },
  { id: 'skills', name: 'Skills Learning', color: '#8b5cf6' },
  { id: 'hobby', name: 'Hobby Development', color: '#38bdf8' },
];

export const PRESET_COLORS = [
  '#f472b6', // pink
  '#fb7185', // rose
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#4ade80', // green
  '#2dd4bf', // teal
  '#22d3ee', // cyan
  '#38bdf8', // sky
  '#60a5fa', // blue
  '#818cf8', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#c084fc', // fuchsia
];

// Legacy support
export const CATEGORY_LABELS: Record<string, string> = {
  health: 'Health & Fitness',
  skills: 'Skills Learning',
  hobby: 'Hobby Development',
};

export const CATEGORY_COLORS: Record<string, string> = {
  health: '#f472b6',
  skills: '#8b5cf6',
  hobby: '#38bdf8',
};
