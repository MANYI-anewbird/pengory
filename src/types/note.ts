export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  createdAt: string;
}
