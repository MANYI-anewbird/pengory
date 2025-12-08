import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, ExternalLink, Globe, RefreshCw, PanelLeftClose, PanelLeft } from 'lucide-react';
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
  const [activeSource, setActiveSource] = useState<NewsSource | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sources from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SOURCES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSources(parsed);
      if (parsed.length > 0) setActiveSource(parsed[0]);
    } else {
      setSources(DEFAULT_SOURCES);
      setActiveSource(DEFAULT_SOURCES[0]);
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
    if (!activeSource) setActiveSource(source);
  };

  const handleDeleteSource = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    setSources(updated);
    if (activeSource?.id === id) {
      setActiveSource(updated[0] || null);
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
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

              {/* Sources List */}
              <div className="flex-1 overflow-auto p-2">
                {sources.length === 0 ? (
                  <div className="text-center py-6">
                    <Globe className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No sources added</p>
                    <p className="text-xs text-gray-300 mt-1">Add your favorite news sites</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sources.map((source, index) => (
                      <motion.div
                        key={source.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <button
                          onClick={() => setActiveSource(source)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group text-left",
                            activeSource?.id === source.id
                              ? "bg-sky-100 text-sky-900"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 truncate text-sm font-medium capitalize">
                            {source.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSource(source.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - iframe */}
        <div className="flex-1 flex flex-col bg-white">
          {activeSource ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium capitalize">{activeSource.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 truncate max-w-md">{activeSource.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-8 px-3 text-gray-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInNewTab(activeSource.url)}
                    className="h-8 px-3 text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </div>

              {/* iframe */}
              <div className="flex-1 relative">
                <iframe
                  key={iframeKey}
                  src={activeSource.url}
                  className="absolute inset-0 w-full h-full border-0"
                  title={activeSource.name}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No source selected</h3>
                <p className="text-sm text-gray-300 mt-1">Add a news source to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
