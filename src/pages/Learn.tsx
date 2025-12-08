import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, ExternalLink, Globe, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

interface NewsSource {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

const SOURCES_KEY = 'learn-news-sources';

const DEFAULT_SOURCES: NewsSource[] = [
  { id: '1', name: 'Financial Times', url: 'https://www.ft.com', addedAt: new Date().toISOString() },
  { id: '2', name: 'BBC News', url: 'https://www.bbc.com/news', addedAt: new Date().toISOString() },
];

export const Learn = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sources from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SOURCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSources(parsed);
    } else {
      setSources(DEFAULT_SOURCES);
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
  }, [sources]);

  const extractName = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return 'Website';
    }
  };

  const handleAddSource = () => {
    if (!newUrl.trim()) return;
    
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const source: NewsSource = {
      id: Date.now().toString(),
      name: extractName(formattedUrl),
      url: formattedUrl,
      addedAt: new Date().toISOString(),
    };
    
    const updated = [...sources, source];
    setSources(updated);
    setNewUrl('');
  };

  const handleDeleteSource = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    setSources(updated);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50 overflow-hidden">
      {/* Header - Compact */}
      <div className="px-6 py-3 border-b border-gray-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-sky-600" />
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-gray-900"
            >
              Learn
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toggle button when sidebar is closed */}
        {!sidebarOpen && (
          <div className="border-r border-gray-200/60 bg-white/80 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 p-0"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Sidebar - News Sources */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-gray-200/60 bg-white/80 flex flex-col overflow-hidden"
            >
              {/* Header with collapse button */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">News Sources</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-7 w-7 p-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>

              {/* Add Source Input */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <Input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
                    placeholder="Paste news site URL..."
                    className="flex-1 h-8 text-sm"
                  />
                  <Button 
                    onClick={handleAddSource}
                    size="sm"
                    className="h-8 px-2 bg-slate-800 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sources List as Link Cards */}
              <div className="flex-1 overflow-auto p-3">
                {sources.length === 0 ? (
                  <div className="text-center py-6">
                    <Globe className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No sources added</p>
                    <p className="text-xs text-gray-300 mt-1">Add your favorite news sites</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <motion.div
                        key={source.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <button
                          onClick={() => openInNewTab(source.url)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all text-left shadow-sm hover:shadow-md"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                            <Globe className="h-5 w-5 text-sky-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-gray-900 capitalize truncate">
                              {source.name}
                            </span>
                            <span className="block text-xs text-gray-400 truncate">
                              {source.url}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-sky-500 transition-colors flex-shrink-0" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSource(source.id);
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Link Cards Grid */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 to-white overflow-auto p-6">
          {sources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <button
                    onClick={() => openInNewTab(source.url)}
                    className="w-full h-full p-5 rounded-2xl bg-white border border-gray-100 hover:border-sky-200 transition-all text-left shadow-sm hover:shadow-lg flex flex-col"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-sky-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 capitalize mb-1">
                      {source.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mb-4">
                      {source.url}
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-sky-600 text-sm font-medium">
                      <span>Open site</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No sources yet</h3>
                <p className="text-sm text-gray-300 mt-1">Add your favorite news sites to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
