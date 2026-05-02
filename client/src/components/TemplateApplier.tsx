import { useState } from 'react';
import { Layout, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  duration: number;
  clips: number;
}

interface TemplateApplierProps {
  onApplyTemplate?: (template: Template) => void;
}

const TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'عرض شرائح حديث',
    description: 'قالب عرض شرائح بتأثيرات انتقالية حديثة',
    thumbnail: '/templates/modern-slideshow.jpg',
    duration: 30,
    clips: 5,
  },
  {
    id: '2',
    name: 'فيديو تعليمي',
    description: 'قالب مثالي للفيديوهات التعليمية',
    thumbnail: '/templates/educational.jpg',
    duration: 60,
    clips: 8,
  },
  {
    id: '3',
    name: 'فيديو موسيقي',
    description: 'قالب لإنشاء فيديوهات موسيقية احترافية',
    thumbnail: '/templates/music-video.jpg',
    duration: 180,
    clips: 12,
  },
  {
    id: '4',
    name: 'فيديو ترويجي',
    description: 'قالب للفيديوهات الترويجية والإعلانات',
    thumbnail: '/templates/promotional.jpg',
    duration: 45,
    clips: 6,
  },
  {
    id: '5',
    name: 'فيديو سيرة ذاتية',
    description: 'قالب لعرض السيرة الذاتية والإنجازات',
    thumbnail: '/templates/portfolio.jpg',
    duration: 90,
    clips: 10,
  },
  {
    id: '6',
    name: 'فيديو سفر',
    description: 'قالب لتجميع فيديوهات الرحلات والسفر',
    thumbnail: '/templates/travel.jpg',
    duration: 120,
    clips: 15,
  },
];

export default function TemplateApplier({ onApplyTemplate }: TemplateApplierProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyTemplate = async (template: Template) => {
    setIsApplying(true);
    try {
      // Simulate applying template
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onApplyTemplate) {
        onApplyTemplate(template);
      }
      
      setSelectedTemplate(template.id);
      toast.success(`تم تطبيق قالب ${template.name}`);
    } catch (error) {
      toast.error('فشل تطبيق القالب');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Layout className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">مكتبة القوالب</h3>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {TEMPLATES.map(template => (
          <div
            key={template.id}
            className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
              selectedTemplate === template.id
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400 opacity-50" />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="font-medium text-white mb-1">{template.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{template.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>{template.duration}s</span>
                <span>{template.clips} مقاطع</span>
              </div>
              <Button
                onClick={() => handleApplyTemplate(template)}
                disabled={isApplying}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs"
              >
                {selectedTemplate === template.id ? 'مطبق' : 'تطبيق'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Template */}
      <div className="pt-4 border-t border-slate-700">
        <Button
          className="w-full gap-2 bg-slate-700 hover:bg-slate-600 text-white"
        >
          <Sparkles className="w-4 h-4" />
          إنشاء قالب مخصص
        </Button>
      </div>
    </div>
  );
}
