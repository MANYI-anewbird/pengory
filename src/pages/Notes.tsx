import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Trash2, ChevronDown, FolderPlus, Save, Edit2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, Notebook } from '@/types/note';
import { toast as sonnerToast } from '@/components/ui/sonner';

const STORAGE_KEYS = {
  NOTEBOOKS: 'notebooks',
  NOTES: 'notes',
  ACTIVE_NOTEBOOK: 'activeNotebook',
  ACTIVE_NOTE: 'activeNote',
};

export const Notes = () => {
  const toast = ({
    title,
    description,
    variant,
  }: {
    title: string;
    description?: string;
    variant?: 'destructive';
  }) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, { description });
      return;
    }
    sonnerToast(title, { description });
  };

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string>('');
  const [activeNoteId, setActiveNoteId] = useState<string>('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingNotebookName, setEditingNotebookName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotebooks = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
    const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    const savedActiveNotebook = localStorage.getItem(STORAGE_KEYS.ACTIVE_NOTEBOOK);
    const savedActiveNote = localStorage.getItem(STORAGE_KEYS.ACTIVE_NOTE);

    if (savedNotebooks) {
      const parsedNotebooks = JSON.parse(savedNotebooks);
      setNotebooks(parsedNotebooks);
      
      if (savedActiveNotebook && parsedNotebooks.some((nb: Notebook) => nb.id === savedActiveNotebook)) {
        setActiveNotebookId(savedActiveNotebook);
      } else if (parsedNotebooks.length > 0) {
        setActiveNotebookId(parsedNotebooks[0].id);
      }
    } else {
      const defaultNotebook: Notebook = {
        id: Date.now().toString(),
        name: 'My Notes',
        createdAt: new Date().toISOString(),
      };
      setNotebooks([defaultNotebook]);
      setActiveNotebookId(defaultNotebook.id);
      localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify([defaultNotebook]));
    }

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      
      if (savedActiveNote && parsedNotes.some((n: Note) => n.id === savedActiveNote)) {
        const note = parsedNotes.find((n: Note) => n.id === savedActiveNote);
        if (note) {
          setActiveNoteId(note.id);
          setNoteContent(note.content);
          setNoteTitle(note.title);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (notebooks.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
    }
  }, [notebooks]);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (activeNotebookId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_NOTEBOOK, activeNotebookId);
    }
  }, [activeNotebookId]);

  useEffect(() => {
    if (activeNoteId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, activeNoteId);
    }
  }, [activeNoteId]);

  useEffect(() => {
    if (!hasUnsavedChanges || !activeNoteId) return;
    const timer = setTimeout(() => {
      handleSaveNote();
    }, 1000);
    return () => clearTimeout(timer);
  }, [noteContent, noteTitle, hasUnsavedChanges]);

  const currentNotebookNotes = notes.filter(n => n.notebookId === activeNotebookId);
  const currentNotebook = notebooks.find(nb => nb.id === activeNotebookId);

  const handleAddNotebook = () => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      name: 'New Notebook',
      createdAt: new Date().toISOString(),
    };
    setNotebooks([...notebooks, newNotebook]);
    setActiveNotebookId(newNotebook.id);
    setActiveNoteId('');
    setNoteContent('');
    setNoteTitle('');
    toast({
      title: 'Notebook created',
      description: newNotebook.name,
    });
  };

  const handleRenameNotebook = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setNotebooks(notebooks.map(nb =>
      nb.id === id ? { ...nb, name: newName.trim() } : nb
    ));
    setEditingNotebookId(null);
    toast({
      title: 'Notebook renamed',
      description: newName.trim(),
    });
  };

  const handleDeleteNotebook = (id: string) => {
    if (notebooks.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'You must have at least one notebook',
        variant: 'destructive',
      });
      return;
    }
    const notesToDelete = notes.filter(n => n.notebookId === id);
    setNotes(notes.filter(n => n.notebookId !== id));
    setNotebooks(notebooks.filter(nb => nb.id !== id));
    
    if (activeNotebookId === id) {
      const remainingNotebooks = notebooks.filter(nb => nb.id !== id);
      setActiveNotebookId(remainingNotebooks[0].id);
      setActiveNoteId('');
      setNoteContent('');
      setNoteTitle('');
    }
    toast({
      title: 'Notebook deleted',
      description: `Deleted ${notesToDelete.length} note(s)`,
    });
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      notebookId: activeNotebookId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setNoteContent('');
    setNoteTitle('Untitled Note');
    setHasUnsavedChanges(false);
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    setNotes(notes.filter(n => n.id !== id));
    
    if (activeNoteId === id) {
      const remainingNotes = notes.filter(n => n.id !== id && n.notebookId === activeNotebookId);
      if (remainingNotes.length > 0) {
        setActiveNoteId(remainingNotes[0].id);
        setNoteContent(remainingNotes[0].content);
        setNoteTitle(remainingNotes[0].title);
      } else {
        setActiveNoteId('');
        setNoteContent('');
        setNoteTitle('');
      }
    }
    
    if (note) {
      toast({
        title: 'Note deleted',
        description: note.title,
      });
    }
  };

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges && activeNoteId) {
      handleSaveNote();
    }
    setActiveNoteId(note.id);
    setNoteContent(note.content);
    setNoteTitle(note.title);
    setHasUnsavedChanges(false);
  };

  const handleContentChange = (content: string) => {
    setNoteContent(content);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (title: string) => {
    setNoteTitle(title);
    setHasUnsavedChanges(true);
  };

  const handleSaveNote = () => {
    if (!activeNoteId) return;
    setNotes(notes.map(n =>
      n.id === activeNoteId
        ? {
            ...n,
            title: noteTitle.trim() || 'Untitled Note',
            content: noteContent,
            updatedAt: new Date().toISOString(),
          }
        : n
    ));
    setHasUnsavedChanges(false);
  };

  const handleMoveNote = (noteId: string, newNotebookId: string) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, notebookId: newNotebookId, updatedAt: new Date().toISOString() }
        : n
    ));
    
    if (activeNoteId === noteId) {
      setActiveNoteId('');
      setNoteContent('');
      setNoteTitle('');
    }
    toast({
      title: 'Note moved',
      description: 'Note moved to ' + notebooks.find(nb => nb.id === newNotebookId)?.name,
    });
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Notes List - 1 part (now 20% for 1:4 ratio) */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '20%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-r border-gray-200/60 bg-white flex flex-col overflow-hidden"
          >
          {/* Notebook Selector */}
          <div className="p-3 border-b border-gray-200/60 space-y-2">
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(true)}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-medium h-9 px-3"
                    >
                      <span className="truncate flex-1 text-sm">
                        {currentNotebook?.name || 'Select Notebook'}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-white">
                    {notebooks.map((notebook) => (
                      <DropdownMenuItem
                        key={notebook.id}
                        onClick={() => {
                          if (hasUnsavedChanges && activeNoteId) {
                            handleSaveNote();
                          }
                          setActiveNotebookId(notebook.id);
                          setActiveNoteId('');
                          setNoteContent('');
                          setNoteTitle('');
                        }}
                        className={cn(
                          "cursor-pointer",
                          activeNotebookId === notebook.id && "bg-blue-50"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate flex-1">{notebook.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-gray-400">
                              {notes.filter(n => n.notebookId === notebook.id).length}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNotebookId(notebook.id);
                                setEditingNotebookName(notebook.name);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotebook(notebook.id);
                              }}
                              disabled={notebooks.length === 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleAddNotebook}
                      className="cursor-pointer text-blue-600"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Notebook
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {editingNotebookId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-xl w-80">
                  <h3 className="font-medium mb-3">Rename Notebook</h3>
                  <Input
                    value={editingNotebookName}
                    onChange={(e) => setEditingNotebookName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameNotebook(editingNotebookId, editingNotebookName);
                      } else if (e.key === 'Escape') {
                        setEditingNotebookId(null);
                      }
                    }}
                    autoFocus
                    className="mb-3"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNotebookId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRenameNotebook(editingNotebookId, editingNotebookName)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddNote}
              disabled={!activeNotebookId}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
          
          {/* Notes List */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence>
              {currentNotebookNotes.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  No notes yet
                </div>
              ) : (
                currentNotebookNotes.map((note, index) => (
                  <TooltipProvider key={note.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => handleSelectNote(note)}
                              className={cn(
                                'p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group',
                                activeNoteId === note.id && 'bg-blue-50'
                              )}
                            >
                              <h3 className="font-medium text-xs text-gray-900 truncate mb-1">
                                {note.title}
                              </h3>
                              <p className="text-2xs text-gray-400">
                                {new Date(note.updatedAt).toLocaleDateString()}
                              </p>
                            </motion.div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48 bg-white z-50">
                            <ContextMenuItem
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Note
                            </ContextMenuItem>
                            {notebooks.length > 1 && (
                              <>
                                <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
                                  Move to:
                                </div>
                                {notebooks
                                  .filter(nb => nb.id !== note.notebookId)
                                  .map(nb => (
                                    <ContextMenuItem
                                      key={nb.id}
                                      onClick={() => handleMoveNote(note.id, nb.id)}
                                      className="cursor-pointer pl-6 text-xs"
                                    >
                                      {nb.name}
                                    </ContextMenuItem>
                                  ))}
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium text-sm">{note.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {note.content ? note.content.substring(0, 100) + '...' : 'Empty note'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - Show when collapsed */}
      {isSidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-4 top-4 z-10"
        >
          <Button
            onClick={() => setIsSidebarCollapsed(false)}
            size="sm"
            className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Note Editor - 4 parts (80% in 1:4 ratio) */}
      <div className="flex-1 flex flex-col bg-white">
        {activeNoteId ? (
          <>
            <div className="border-b border-gray-200/60 p-4 flex items-center justify-between">
              <Input
                value={noteTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className="text-xl font-medium border-none focus-visible:ring-0 px-0"
              />
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600">Unsaved</span>
                )}
                <Button
                  onClick={handleSaveNote}
                  size="sm"
                  variant={hasUnsavedChanges ? "default" : "ghost"}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-auto">
              <Textarea
                value={noteContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing..."
                className="w-full h-full resize-none border-none focus-visible:ring-0 text-base leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">Select a note to start writing</p>
              <p className="text-sm">or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
