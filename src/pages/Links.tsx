import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Globe, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  createdAt: string;
}

const LINKS_STORAGE_KEY = 'pompom_links_v2';

export const Links = () => {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    try {
      const raw = localStorage.getItem(LINKS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
    } catch {
      // ignore
    }
  }, [links]);

  const handleAddLink = () => {
    if (!newUrl.trim() || !newTitle.trim()) return;
    const newLink: LinkItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      createdAt: new Date().toISOString(),
    };
    setLinks(prev => [...prev, newLink]);
    setNewUrl('');
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks(prev => prev.filter(l => l.id !== linkId));
  };

  const handleStartEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditDescription(link.description);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    setLinks(prev =>
      prev.map(link =>
        link.id === editingId
          ? { ...link, title: editTitle.trim(), description: editDescription.trim() }
          : link
      )
    );
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

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
            <p className="text-xs text-slate-500">{links.length} link{links.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="gap-1.5 bg-slate-800 hover:bg-slate-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {links.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-white"
            >
              <div className="p-5 rounded-2xl mb-5 shadow-lg bg-slate-100">
                <Globe className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Links Yet</h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                Start saving useful links for quick access
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2 px-6 shadow-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Your First Link
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {links.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    {editingId === link.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Link title"
                          autoFocus
                        />
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)"
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit} className="bg-slate-800 hover:bg-slate-700">
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-start gap-4">
                        {/* Link Button */}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors font-medium text-sm border border-sky-100"
                        >
                          {link.title}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {/* Description */}
                        <div className="flex-1 min-w-0 pt-1">
                          <p className={cn(
                            "text-sm text-slate-600",
                            !link.description && "text-slate-400 italic"
                          )}>
                            {link.description || "No description"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleStartEdit(link)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add More Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: links.length * 0.03 }}
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-white/50"
              >
                <Plus className="h-4 w-4" />
                Add Another Link
              </motion.button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Link Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
              <Input
                placeholder="Link title (displayed on button)"
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
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
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
