export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface LinkCategory {
  id: string;
  name: string;
  color: string;
  links: LinkItem[];
}

export const DEFAULT_LINK_CATEGORIES: LinkCategory[] = [
  { id: 'learning', name: 'Learning', color: '#1e3a5f', links: [] },
  { id: 'ai-tool', name: 'AI Tool', color: '#2563eb', links: [] },
  { id: 'entertainment', name: 'Entertainment', color: '#38bdf8', links: [] },
];

export const LINK_PRESET_COLORS = [
  '#1e3a5f', // dark blue
  '#2563eb', // royal blue
  '#38bdf8', // sky blue
  '#0d9488', // teal
  '#059669', // emerald
  '#65a30d', // lime
  '#ca8a04', // amber
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
  '#9333ea', // purple
  '#6366f1', // indigo
];
