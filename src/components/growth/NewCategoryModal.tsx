import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomCategory, PRESET_COLORS } from '@/types/growth';
import { cn } from '@/lib/utils';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<CustomCategory, 'id'>) => void;
  existingNames: string[];
}

export const NewCategoryModal = ({ isOpen, onClose, onSave, existingNames }: NewCategoryModalProps) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter a category name');
      return;
    }
    
    if (existingNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError('This category name already exists');
      return;
    }

    onSave({ name: trimmedName, color: selectedColor });
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setError('');
  };

  const handleClose = () => {
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div 
            className="p-6 border-b border-slate-100"
            style={{ background: `linear-gradient(135deg, ${selectedColor}20, ${selectedColor}05)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-xl shadow-md"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">New Category</h2>
                  <p className="text-xs text-slate-500">Create a custom growth category</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-sm font-semibold text-slate-700">
                Category Name
              </Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Mindfulness, Creativity, Finance..."
                className="h-11"
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                Choose Color
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'h-10 w-full rounded-lg transition-all duration-200 flex items-center justify-center',
                      selectedColor === color 
                        ? 'ring-2 ring-offset-2 scale-110' 
                        : 'hover:scale-105'
                    )}
                    style={{ 
                      backgroundColor: color,
                      ['--tw-ring-color' as any]: color
                    }}
                  >
                    {selectedColor === color && (
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Preview</Label>
              <div 
                className="p-4 rounded-xl border-2 border-dashed flex items-center gap-3"
                style={{ 
                  borderColor: `${selectedColor}50`,
                  backgroundColor: `${selectedColor}10`
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="font-medium text-slate-700">
                  {name.trim() || 'Your Category Name'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 text-white"
              style={{ backgroundColor: selectedColor }}
            >
              Create Category
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
