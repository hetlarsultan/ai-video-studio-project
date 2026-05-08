import React, { useEffect, useState } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';

export const FFmpegLoadingIndicator: React.FC = () => {
  const { loadingProgress, loadingMessage } = useConnection();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // تحديث التقدم بسلاسة
  useEffect(() => {
    if (loadingProgress > 0 && loadingProgress < 100) {
      setIsVisible(true);
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          const target = loadingProgress;
          const diff = target - prev;
          if (Math.abs(diff) < 1) return target;
          return prev + diff * 0.3;
        });
      }, 50);
      return () => clearInterval(interval);
    } else if (loadingProgress === 100) {
      setDisplayProgress(100);
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
         style={{ opacity: isVisible ? 1 : 0 }}>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 border border-slate-700">
        {/* رسم متحرك دائري */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            {/* الدائرة الخارجية */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeDasharray={`${(displayProgress / 100) * 283} 283`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* النسبة المئوية في المركز */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {Math.round(displayProgress)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">تحميل</div>
              </div>
            </div>
          </div>
        </div>

        {/* رسالة الحالة */}
        <div className="text-center mb-6">
          <p className="text-slate-200 font-medium text-sm mb-2">
            {loadingMessage || 'جاري تحميل FFmpeg...'}
          </p>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
              style={{
                width: `${displayProgress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* نقاط متحركة */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* رسالة مساعدة */}
        <p className="text-xs text-slate-500 text-center mt-6">
          يرجى الانتظار أثناء تحميل المكتبات...
        </p>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};
