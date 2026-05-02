import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye } from 'lucide-react';

export interface VisualEffect {
  id: string;
  name: string;
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'sepia' | 'hueRotate' | 'invert' | 'saturate';
  value: number;
  min: number;
  max: number;
  unit: string;
}

export const VISUAL_EFFECTS: VisualEffect[] = [
  { id: 'blur', name: 'Blur', type: 'blur', value: 0, min: 0, max: 20, unit: 'px' },
  { id: 'brightness', name: 'Brightness', type: 'brightness', value: 100, min: 0, max: 200, unit: '%' },
  { id: 'contrast', name: 'Contrast', type: 'contrast', value: 100, min: 0, max: 200, unit: '%' },
  { id: 'grayscale', name: 'Grayscale', type: 'grayscale', value: 0, min: 0, max: 100, unit: '%' },
  { id: 'sepia', name: 'Sepia', type: 'sepia', value: 0, min: 0, max: 100, unit: '%' },
  { id: 'hueRotate', name: 'Hue Rotate', type: 'hueRotate', value: 0, min: 0, max: 360, unit: 'deg' },
  { id: 'invert', name: 'Invert', type: 'invert', value: 0, min: 0, max: 100, unit: '%' },
  { id: 'saturate', name: 'Saturate', type: 'saturate', value: 100, min: 0, max: 200, unit: '%' },
];

interface VisualEffectsProps {
  onEffectChange?: (effects: Record<string, number>) => void;
}

export default function VisualEffects({ onEffectChange }: VisualEffectsProps) {
  const [effects, setEffects] = useState<Record<string, number>>(
    VISUAL_EFFECTS.reduce((acc, effect) => ({ ...acc, [effect.id]: effect.value }), {})
  );

  const handleEffectChange = (effectId: string, value: number) => {
    const newEffects = { ...effects, [effectId]: value };
    setEffects(newEffects);
    onEffectChange?.(newEffects);
  };

  const getFilterStyle = () => {
    const filters: string[] = [];
    
    if (effects.blur) filters.push(`blur(${effects.blur}px)`);
    if (effects.brightness !== 100) filters.push(`brightness(${effects.brightness}%)`);
    if (effects.contrast !== 100) filters.push(`contrast(${effects.contrast}%)`);
    if (effects.grayscale) filters.push(`grayscale(${effects.grayscale}%)`);
    if (effects.sepia) filters.push(`sepia(${effects.sepia}%)`);
    if (effects.hueRotate) filters.push(`hue-rotate(${effects.hueRotate}deg)`);
    if (effects.invert) filters.push(`invert(${effects.invert}%)`);
    if (effects.saturate !== 100) filters.push(`saturate(${effects.saturate}%)`);
    
    return filters.join(' ');
  };

  const resetEffects = () => {
    const resetValues = VISUAL_EFFECTS.reduce((acc, effect) => ({ ...acc, [effect.id]: effect.value }), {});
    setEffects(resetValues);
    onEffectChange?.(resetValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Visual Effects</h3>
        </div>
        <Button
          onClick={resetEffects}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VISUAL_EFFECTS.map((effect) => (
          <Card key={effect.id} className="bg-slate-800/50 border-slate-700 p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">
                  {effect.name}
                </label>
                <span className="text-xs text-cyan-400 font-mono">
                  {effects[effect.id]}{effect.unit}
                </span>
              </div>
              <input
                type="range"
                min={effect.min}
                max={effect.max}
                value={effects[effect.id]}
                onChange={(e) => handleEffectChange(effect.id, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Preview */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-medium text-white">Preview</h4>
        </div>
        <div
          className="w-full h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center"
          style={{ filter: getFilterStyle() }}
        >
          <span className="text-slate-400 text-sm">Effect Preview</span>
        </div>
      </Card>
    </div>
  );
}
