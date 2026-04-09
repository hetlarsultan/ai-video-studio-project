import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Zap, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TransitionProps {
  onAddTransition: (transition: TransitionData) => void;
  onClose: () => void;
}

export interface TransitionData {
  id: string;
  type: string;
  duration: number;
  easing: string;
  clipId: string;
}

const TRANSITION_TYPES = [
  { label: 'Fade', value: 'fade', icon: '◐' },
  { label: 'Slide Left', value: 'slideLeft', icon: '→' },
  { label: 'Slide Right', value: 'slideRight', icon: '←' },
  { label: 'Slide Up', value: 'slideUp', icon: '↑' },
  { label: 'Slide Down', value: 'slideDown', icon: '↓' },
  { label: 'Zoom In', value: 'zoomIn', icon: '⊕' },
  { label: 'Zoom Out', value: 'zoomOut', icon: '⊖' },
  { label: 'Blur', value: 'blur', icon: '◯' },
  { label: 'Wipe', value: 'wipe', icon: '⊡' },
  { label: 'Cross Fade', value: 'crossFade', icon: '◈' },
];

const EASING_OPTIONS = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'easeIn' },
  { label: 'Ease Out', value: 'easeOut' },
  { label: 'Ease In Out', value: 'easeInOut' },
];

export function Transitions({ onAddTransition, onClose }: TransitionProps) {
  const [selectedType, setSelectedType] = useState('fade');
  const [duration, setDuration] = useState(0.5);
  const [easing, setEasing] = useState('easeInOut');

  const handleAddTransition = () => {
    const transitionData: TransitionData = {
      id: Date.now().toString(),
      type: selectedType,
      duration,
      easing,
      clipId: '',
    };

    onAddTransition(transitionData);
    toast.success('تم إضافة المؤثر الانتقالي بنجاح');
    onClose();
  };

  const selectedTransition = TRANSITION_TYPES.find(t => t.value === selectedType);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            إضافة مؤثر انتقالي
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transition Types Grid */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              نوع المؤثر
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TRANSITION_TYPES.map(transition => (
                <button
                  key={transition.value}
                  onClick={() => setSelectedType(transition.value)}
                  className={`py-3 px-2 rounded text-center transition-all ${
                    selectedType === transition.value
                      ? 'bg-cyan-500 text-white border-2 border-cyan-400'
                      : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                  title={transition.label}
                >
                  <div className="text-2xl mb-1">{transition.icon}</div>
                  <div className="text-xs font-medium">{transition.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-700 rounded p-6 border border-slate-600">
            <p className="text-xs text-slate-400 mb-3">معاينة:</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-20 h-20 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                من
              </div>
              <div className="text-2xl text-cyan-400">{selectedTransition?.icon}</div>
              <div className="w-20 h-20 bg-purple-500 rounded flex items-center justify-center text-white font-bold">
                إلى
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              المدة: {duration.toFixed(1)}s
            </label>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Easing */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              نوع الحركة
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EASING_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setEasing(option.value)}
                  className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                    easing === option.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddTransition}
              className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة المؤثر
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
