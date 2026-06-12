
import { Film, Sparkles, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="header-enhanced">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Film className="w-12 h-12 text-blue-400" />
          <Sparkles className="w-5 h-5 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎬 AI Video Studio Pro
        </h1>
      </div>
      
      <p className="text-lg text-slate-300 mb-4">
        أداة احترافية لتحويل النصوص والصور إلى فيديوهات وصور متحركة
      </p>
      
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span>✨ نسخة محسّنة مع واجهة مستخدم أفضل وتحكم أوضح</span>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
