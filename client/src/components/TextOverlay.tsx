import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Type, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TextOverlayProps {
  onAddText: (text: TextOverlayData) => void;
  onClose: () => void;
}

export interface TextOverlayData {
  id: string;
  text: string;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  position: 'top' | 'center' | 'bottom';
  opacity: number;
  duration: number;
  startTime: number;
}

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
];

const POSITIONS = [
  { label: 'أعلى', value: 'top' },
  { label: 'وسط', value: 'center' },
  { label: 'أسفل', value: 'bottom' },
];

export function TextOverlay({ onAddText, onClose }: TextOverlayProps) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [opacity, setOpacity] = useState(100);
  const [duration, setDuration] = useState(5);
  const [startTime, setStartTime] = useState(0);

  const handleAddText = () => {
    if (!text.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }

    const textData: TextOverlayData = {
      id: Date.now().toString(),
      text,
      fontSize,
      fontColor,
      fontFamily,
      position,
      opacity,
      duration,
      startTime,
    };

    onAddText(textData);
    toast.success('تم إضافة النص بنجاح');
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-cyan-400" />
            إضافة نص
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              النص
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل النص الذي تريد إضافته..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 resize-none"
              rows={3}
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              نوع الخط
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              {FONT_FAMILIES.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              حجم الخط: {fontSize}px
            </label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Font Color */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              لون الخط
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              الموضع
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(pos => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value as any)}
                  className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                    position === pos.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              الشفافية: {opacity}%
            </label>
            <Slider
              value={[opacity]}
              onValueChange={(value) => setOpacity(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              المدة: {duration}s
            </label>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={1}
              max={60}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              وقت البدء: {startTime}s
            </label>
            <Slider
              value={[startTime]}
              onValueChange={(value) => setStartTime(value[0])}
              min={0}
              max={300}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-700 rounded p-4 border border-slate-600">
            <p className="text-xs text-slate-400 mb-2">معاينة:</p>
            <div
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                color: fontColor,
                opacity: opacity / 100,
                textAlign: 'center',
              }}
              className="py-4"
            >
              {text || 'النص سيظهر هنا'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddText}
              className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة النص
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
