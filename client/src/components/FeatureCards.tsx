import { Film, Image, Music, Zap, Sparkles, Wand2 } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Film className="w-6 h-6" />,
    title: 'تحويل النص إلى فيديو',
    description: 'أنشئ فيديو احترافي من نص بسيط',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Image className="w-6 h-6" />,
    title: 'تحويل الصور إلى فيديو',
    description: 'أنشئ فيديو سلس من مجموعة صور',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'إنشاء صور متحركة GIF',
    description: 'أنشئ صورة متحركة من مجموعة صور',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: <Music className="w-6 h-6" />,
    title: 'تحويل النص إلى صوت',
    description: 'حول نصك إلى صوت احترافي',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'تأثيرات متقدمة',
    description: 'أضف تأثيرات بصرية وصوتية احترافية',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: 'تحرير متقدم',
    description: 'تحكم كامل على كل جزء من المشروع',
    color: 'from-red-500 to-red-600',
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="card-enhanced group cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
            <div className="text-white">{feature.icon}</div>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
