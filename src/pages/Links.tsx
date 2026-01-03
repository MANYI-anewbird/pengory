import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Globe, Pencil, Check, X, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface LinkCategory {
  id: string;
  name: string;
  color: string;
  links: LinkItem[];
}

const BLUE_COLORS = [
  '#1e3a5f', // dark navy
  '#1e40af', // blue 800
  '#2563eb', // blue 600
  '#3b82f6', // blue 500
  '#0369a1', // sky 700
  '#0284c7', // sky 600
  '#0891b2', // cyan 600
  '#0d9488', // teal 600
];

const LINKS_STORAGE_KEY = 'pompom_links_v3';

export const Links = () => {
  const [categories, setCategories] = useState<LinkCategory[]>(() => {
    try {
      const raw = localStorage.getItem(LINKS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(BLUE_COLORS[0]);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [editLinkDescription, setEditLinkDescription] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: LinkCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      links: [],
    };
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryColor(BLUE_COLORS[Math.floor(Math.random() * BLUE_COLORS.length)]);
    setIsAddCategoryModalOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleStartEditCategory = (category: LinkCategory) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
  };

  const handleSaveEditCategory = () => {
    if (!editingCategoryId || !editCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    setCategories(prev =>
      prev.map(cat =>
        cat.id === editingCategoryId
          ? { ...cat, name: editCategoryName.trim() }
          : cat
      )
    );
    setEditingCategoryId(null);
    setEditCategoryName('');
  };

  const openAddLinkModal = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setIsAddLinkModalOpen(true);
  };

  const handleAddLink = () => {
    if (!activeCategoryId || !newUrl.trim() || !newTitle.trim()) return;
    const newLink: LinkItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      title: newTitle.trim(),
      description: newDescription.trim(),
    };
    setCategories(prev =>
      prev.map(cat =>
        cat.id === activeCategoryId
          ? { ...cat, links: [...cat.links, newLink] }
          : cat
      )
    );
    setNewUrl('');
    setNewTitle('');
    setNewDescription('');
    setIsAddLinkModalOpen(false);
    setActiveCategoryId(null);
  };

  const handleDeleteLink = (categoryId: string, linkId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, links: cat.links.filter(l => l.id !== linkId) }
          : cat
      )
    );
  };

  const handleStartEditLink = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setEditLinkTitle(link.title);
    setEditLinkDescription(link.description);
  };

  const handleSaveEditLink = (categoryId: string) => {
    if (!editingLinkId || !editLinkTitle.trim()) {
      setEditingLinkId(null);
      return;
    }
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              links: cat.links.map(link =>
                link.id === editingLinkId
                  ? { ...link, title: editLinkTitle.trim(), description: editLinkDescription.trim() }
                  : link
              ),
            }
          : cat
      )
    );
    setEditingLinkId(null);
    setEditLinkTitle('');
    setEditLinkDescription('');
  };

  const totalLinks = categories.reduce((acc, cat) => acc + cat.links.length, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Link Archive</h1>
            <p className="text-xs text-slate-500">
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}, {totalLinks} link{totalLinks !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddCategoryModalOpen(true)}
          size="sm"
          className="gap-1.5 bg-slate-800 hover:bg-slate-700 text-white"
        >
          <FolderPlus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-white"
            >
              <div className="p-5 rounded-2xl mb-5 shadow-lg bg-slate-100">
                <Globe className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Categories Yet</h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                Create a category to start organizing your links
              </p>
              <Button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="gap-2 px-6 shadow-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                <FolderPlus className="h-4 w-4" />
                Create Your First Category
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {categories.map((category, catIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: catIndex * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Category Header */}
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {editingCategoryId === category.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditCategory();
                              if (e.key === 'Escape') setEditingCategoryId(null);
                            }}
                            autoFocus
                            className="text-base font-semibold bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-slate-400"
                          />
                          <button
                            onClick={handleSaveEditCategory}
                            className="p-1 rounded hover:bg-white/50 text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="p-1 rounded hover:bg-white/50 text-slate-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                      )}
                      <span className="text-xs text-slate-400">
                        ({category.links.length} link{category.links.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditCategory(category)}
                        className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-3 items-start">
                      {category.links.map((link) => (
                        <TooltipProvider key={link.id} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group relative inline-flex items-center">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {link.title}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteLink(category.id, link.id);
                                    }}
                                    className="p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </TooltipTrigger>
                            {link.description && (
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p className="text-sm">{link.description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ))}

                      {/* Add Link Button */}
                      <button
                        onClick={() => openAddLinkModal(category.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm text-slate-400 hover:text-slate-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Add Category Button at bottom */}
          {categories.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="w-full py-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-white transition-all flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600"
            >
              <FolderPlus className="h-4 w-4" />
              Add Another Category
            </motion.button>
          )}
        </div>
      </ScrollArea>

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Category Name</label>
              <Input
                placeholder="e.g., Learning Resources"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {BLUE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      newCategoryColor === color
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                style={{ backgroundColor: newCategoryColor }}
                className="text-white"
              >
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Link Modal */}
      <Dialog open={isAddLinkModalOpen} onOpenChange={setIsAddLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">URL</label>
              <Input
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Button Title</label>
              <Input
                placeholder="Link name (displayed on button)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description (optional)</label>
              <Textarea
                placeholder="What is this link about?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddLinkModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={!newUrl.trim() || !newTitle.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
