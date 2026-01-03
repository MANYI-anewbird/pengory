import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Link as LinkIcon, ExternalLink, Trash2, FolderPlus, 
  BookOpen, Gamepad2, Wrench, Sparkles, Globe, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LinkCategory, LinkItem, DEFAULT_LINK_CATEGORIES, LINK_PRESET_COLORS } from '@/types/link';
import { cn } from '@/lib/utils';

const LINKS_STORAGE_KEY = 'pompom_links_v1';

const DEFAULT_ICONS: Record<string, any> = {
  learning: BookOpen,
  entertainment: Gamepad2,
  tools: Wrench,
};

export const Links = () => {
  const [categories, setCategories] = useState<LinkCategory[]>(() => {
    try {
      const raw = localStorage.getItem(LINKS_STORAGE_KEY);
      if (!raw) return DEFAULT_LINK_CATEGORIES;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LINK_CATEGORIES;
    } catch {
      return DEFAULT_LINK_CATEGORIES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>(() => categories[0]?.id || 'learning');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(LINK_PRESET_COLORS[0]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  const activeConfig = useMemo(() => {
    return categories.find(c => c.id === activeCategory) || categories[0] || DEFAULT_LINK_CATEGORIES[0];
  }, [categories, activeCategory]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: LinkCategory = {
      id: `custom_${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      links: [],
    };
    setCategories(prev => [...prev, newCategory]);
    setActiveCategory(newCategory.id);
    setNewCategoryName('');
    setNewCategoryColor(LINK_PRESET_COLORS[0]);
    setIsNewCategoryModalOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    if (activeCategory === categoryId) {
      const remaining = categories.filter(c => c.id !== categoryId);
      setActiveCategory(remaining[0]?.id || 'learning');
    }
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkTitle.trim()) return;
    const newLink: LinkItem = {
      id: Date.now().toString(),
      url: newLinkUrl.trim(),
      title: newLinkTitle.trim(),
      description: newLinkDescription.trim(),
      createdAt: new Date().toISOString(),
    };
    setCategories(prev =>
      prev.map(cat =>
        cat.id === activeCategory
          ? { ...cat, links: [...cat.links, newLink] }
          : cat
      )
    );
    setNewLinkUrl('');
    setNewLinkTitle('');
    setNewLinkDescription('');
    setIsAddLinkModalOpen(false);
  };

  const handleDeleteLink = (linkId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === activeCategory
          ? { ...cat, links: cat.links.filter(l => l.id !== linkId) }
          : cat
      )
    );
  };

  const toggleLinkExpand = (linkId: string) => {
    setExpandedLinks(prev => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      return next;
    });
  };

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  const isDefaultCategory = (id: string) => ['learning', 'entertainment', 'tools'].includes(id);

  const totalLinks = categories.reduce((acc, cat) => acc + cat.links.length, 0);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 min-h-screen">
      {/* Left Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Link Archive</h1>
              <p className="text-xs text-slate-500">Save & organize links</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overview</span>
              <LinkIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Links</span>
              <span className="text-xl font-bold text-slate-900">{totalLinks}</span>
            </div>
          </div>

          {/* Category List */}
          <ScrollArea className="flex-1 max-h-80">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Categories</span>
              {categories.map((cat) => {
                const Icon = DEFAULT_ICONS[cat.id] || Sparkles;
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all cursor-pointer group relative',
                      activeCategory === cat.id
                        ? 'border-transparent text-white shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                    style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          activeCategory === cat.id ? 'bg-white/25' : 'bg-slate-100'
                        )}>
                          {cat.links.length}
                        </span>
                        {!isDefaultCategory(cat.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat.id);
                            }}
                            className={cn(
                              'opacity-0 group-hover:opacity-100 p-1 rounded transition-all',
                              activeCategory === cat.id
                                ? 'hover:bg-white/20'
                                : 'hover:bg-red-50 text-red-400'
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Add Category Button */}
        <div className="mt-auto p-4 border-t border-slate-100">
          <Button
            onClick={() => setIsNewCategoryModalOpen(true)}
            variant="outline"
            className="w-full gap-2 border-dashed"
          >
            <FolderPlus className="h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: activeConfig.color }}
            >
              {(() => {
                const Icon = DEFAULT_ICONS[activeCategory] || Sparkles;
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeConfig.name}</h2>
              <p className="text-xs text-slate-500">
                {activeConfig.links.length} link{activeConfig.links.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddLinkModalOpen(true)}
            size="sm"
            className="gap-1.5 text-white"
            style={{ backgroundColor: activeConfig.color }}
          >
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>

        {/* Colored accent line */}
        <motion.div
          key={activeCategory + '-line'}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="h-1 origin-left"
          style={{ backgroundColor: activeConfig.color }}
        />

        {/* Links Content */}
        <ScrollArea className="flex-1">
          <div
            className="p-6 min-h-full"
            style={{ backgroundColor: `${activeConfig.color}10` }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {activeConfig.links.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed relative overflow-hidden"
                    style={{
                      borderColor: `${activeConfig.color}50`,
                      background: `linear-gradient(to bottom right, ${activeConfig.color}20, ${activeConfig.color}05)`
                    }}
                  >
                    <Sparkles
                      className="absolute top-6 right-8 h-6 w-6 opacity-40"
                      style={{ color: activeConfig.color }}
                    />
                    <Sparkles
                      className="absolute bottom-8 left-10 h-5 w-5 opacity-30"
                      style={{ color: activeConfig.color }}
                    />

                    <div
                      className="p-5 rounded-2xl mb-5 shadow-lg bg-white border"
                      style={{ borderColor: `${activeConfig.color}30` }}
                    >
                      {(() => {
                        const Icon = DEFAULT_ICONS[activeCategory] || Sparkles;
                        return <Icon className="h-10 w-10" style={{ color: activeConfig.color }} />;
                      })()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      No Links Yet
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                      Start saving useful links to this category
                    </p>
                    <Button
                      onClick={() => setIsAddLinkModalOpen(true)}
                      className="gap-2 px-6 shadow-lg text-white"
                      style={{ backgroundColor: activeConfig.color }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Link
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    {activeConfig.links.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-base font-semibold text-slate-900 hover:underline truncate flex items-center gap-1.5"
                                  style={{ color: activeConfig.color }}
                                >
                                  {link.title}
                                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                </a>
                              </div>
                              <p className="text-xs text-slate-400 truncate mb-2">
                                {extractDomain(link.url)}
                              </p>
                              {link.description && (
                                <div>
                                  <p className={cn(
                                    "text-sm text-slate-600 transition-all",
                                    expandedLinks.has(link.id) ? "" : "line-clamp-2"
                                  )}>
                                    {link.description}
                                  </p>
                                  {link.description.length > 100 && (
                                    <button
                                      onClick={() => toggleLinkExpand(link.id)}
                                      className="text-xs mt-1 flex items-center gap-0.5"
                                      style={{ color: activeConfig.color }}
                                    >
                                      {expandedLinks.has(link.id) ? (
                                        <>Show less <ChevronUp className="h-3 w-3" /></>
                                      ) : (
                                        <>Show more <ChevronDown className="h-3 w-3" /></>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Add More Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: activeConfig.links.length * 0.03 }}
                      onClick={() => setIsAddLinkModalOpen(true)}
                      className="w-full py-4 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.01] bg-white/50"
                      style={{
                        borderColor: `${activeConfig.color}50`,
                        color: activeConfig.color
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Link
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

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
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
              <Input
                placeholder="Link title"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description (optional)</label>
              <Textarea
                placeholder="What is this link about?"
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddLinkModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                style={{ backgroundColor: activeConfig.color }}
                className="text-white"
              >
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Category Modal */}
      <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Category Name</label>
              <Input
                placeholder="e.g., Design Resources"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {LINK_PRESET_COLORS.map((color) => (
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
              <Button variant="outline" onClick={() => setIsNewCategoryModalOpen(false)}>
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
    </div>
  );
};
