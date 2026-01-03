import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Globe, Pencil, Check, X, FolderPlus, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter categories and links based on search
  const filteredCategories = searchQuery.trim()
    ? categories
        .map(cat => ({
          ...cat,
          links: cat.links.filter(link =>
            link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(cat => cat.links.length > 0 || cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Links</h1>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        <Button
          onClick={() => setIsAddCategoryModalOpen(true)}
          size="sm"
          className="gap-1 bg-slate-800 hover:bg-slate-700 text-white h-8 text-xs"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Add Category
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCategories.length === 0 && !searchQuery ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-slate-200 bg-white"
            >
              <div className="p-4 rounded-xl mb-4 bg-slate-100">
                <Globe className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Categories Yet</h3>
              <p className="text-sm text-slate-500 mb-4 text-center max-w-xs">
                Create a category to start organizing your links
              </p>
              <Button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="gap-2 px-4 shadow-md bg-slate-800 hover:bg-slate-700 text-white text-sm"
              >
                <FolderPlus className="h-4 w-4" />
                Create Category
              </Button>
            </motion.div>
          ) : filteredCategories.length === 0 && searchQuery ? (
            <div className="text-center py-12 text-slate-500">
              No links found for "{searchQuery}"
            </div>
          ) : (
            <AnimatePresence>
              {filteredCategories.map((category, catIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: catIndex * 0.03 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Category Header */}
                  <div
                    className="px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: `${category.color}10` }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {editingCategoryId === category.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditCategory();
                              if (e.key === 'Escape') setEditingCategoryId(null);
                            }}
                            autoFocus
                            className="text-sm font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 outline-none focus:border-slate-400"
                          />
                          <button
                            onClick={handleSaveEditCategory}
                            className="p-0.5 rounded hover:bg-white/50 text-green-600"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="p-0.5 rounded hover:bg-white/50 text-slate-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-semibold text-slate-900">{category.name}</h3>
                      )}
                      <span className="text-xs text-slate-400">
                        ({category.links.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleStartEditCategory(category)}
                        className="p-1 rounded hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="px-3 py-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      {category.links.map((link) => (
                        <TooltipProvider key={link.id} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group relative inline-flex items-center">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-white transition-all hover:opacity-90 hover:shadow-sm"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {link.title}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                                <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteLink(category.id, link.id);
                                    }}
                                    className="p-0.5 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            </TooltipTrigger>
                            {link.description && (
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p className="text-xs">{link.description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ))}

                      {/* Add Link Button */}
                      <button
                        onClick={() => openAddLinkModal(category.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs text-slate-400 hover:text-slate-600"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Add Category Button at bottom */}
          {categories.length > 0 && !searchQuery && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="w-full py-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-white transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Add Category
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
