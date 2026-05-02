import { useState } from 'react';
import { Music, Volume2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Sound {
  id: string;
  name: string;
  url: string;
  category: 'effects' | 'music' | 'ambient';
  duration: number;
}

interface SoundLibraryProps {
  onSelectSound?: (sound: Sound) => void;
}

const DEFAULT_SOUNDS: Sound[] = [
  {
    id: '1',
    name: 'موسيقى درامية',
    url: '/sounds/dramatic.mp3',
    category: 'music',
    duration: 120,
  },
  {
    id: '2',
    name: 'موسيقى هادئة',
    url: '/sounds/calm.mp3',
    category: 'music',
    duration: 180,
  },
  {
    id: '3',
    name: 'صوت انفجار',
    url: '/sounds/explosion.mp3',
    category: 'effects',
    duration: 2,
  },
  {
    id: '4',
    name: 'صوت خطوات',
    url: '/sounds/footsteps.mp3',
    category: 'effects',
    duration: 3,
  },
  {
    id: '5',
    name: 'أصوات الطبيعة',
    url: '/sounds/nature.mp3',
    category: 'ambient',
    duration: 300,
  },
  {
    id: '6',
    name: 'موسيقى حماسية',
    url: '/sounds/energetic.mp3',
    category: 'music',
    duration: 150,
  },
];

export default function SoundLibrary({ onSelectSound }: SoundLibraryProps) {
  const [sounds] = useState<Sound[]>(DEFAULT_SOUNDS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'effects' | 'music' | 'ambient'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSounds = sounds.filter(sound => {
    const matchesCategory = selectedCategory === 'all' || sound.category === selectedCategory;
    const matchesSearch = sound.name.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleAddSound = (sound: Sound) => {
    if (onSelectSound) {
      onSelectSound(sound);
      toast.success(`تم إضافة ${sound.name}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">مكتبة الأصوات</h3>
      </div>

      {/* Search */}
      <Input
        placeholder="ابحث عن صوت..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
      />

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'music', 'effects', 'ambient'].map(category => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            className={
              selectedCategory === category
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }
          >
            {category === 'all' ? 'الكل' : category === 'music' ? 'موسيقى' : category === 'effects' ? 'مؤثرات' : 'محيط'}
          </Button>
        ))}
      </div>

      {/* Sounds Grid */}
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {filteredSounds.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">لا توجد أصوات</p>
        ) : (
          filteredSounds.map(sound => (
            <div
              key={sound.id}
              className="bg-slate-700 rounded-lg p-3 flex items-center justify-between hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Volume2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{sound.name}</p>
                  <p className="text-xs text-slate-400">{sound.duration}s</p>
                </div>
              </div>
              <Button
                onClick={() => handleAddSound(sound)}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white gap-1 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Upload Custom Sound */}
      <div className="pt-4 border-t border-slate-700">
        <Button
          className="w-full gap-2 bg-slate-700 hover:bg-slate-600 text-white"
        >
          <Plus className="w-4 h-4" />
          تحميل صوت مخصص
        </Button>
      </div>
    </div>
  );
}
