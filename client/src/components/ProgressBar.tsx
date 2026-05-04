import React from 'react';
import { useConnection } from '@/contexts/ConnectionContext';

/**
 * مكون شريط التقدم لعرض حالة التحميل
 * يعرض شريط تقدم بصري مع رسالة الحالة الحالية
 */
export const ProgressBar: React.FC = () => {
  const { connectionStatus, loadingProgress, loadingMessage, isFFmpegReady } = useConnection();

  // إذا كان النظام جاهزاً أو متصلاً بالإنترنت، لا نعرض شريط التقدم
  if (connectionStatus === 'online' && isFFmpegReady) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      <div className="w-full px-4 py-3">
        {/* رسالة الحالة */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            {loadingMessage}
          </span>
          <span className="text-xs text-slate-400">{Math.round(loadingProgress)}%</span>
        </div>

        {/* شريط التقدم */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{
              width: `${loadingProgress}%`,
              boxShadow: `0 0 10px rgba(34, 211, 238, ${loadingProgress / 100})`,
            }}
          />
        </div>

        {/* نص معلومات إضافي */}
        {connectionStatus === 'loading' && (
          <div className="mt-2 text-xs text-slate-400 text-center">
            {loadingProgress < 30 && 'جاري تحميل المكتبات الأساسية...'}
            {loadingProgress >= 30 && loadingProgress < 60 && 'جاري تهيئة FFmpeg...'}
            {loadingProgress >= 60 && loadingProgress < 90 && 'جاري تحميل المكتبات الإضافية...'}
            {loadingProgress >= 90 && 'يكاد ينتهي التحميل...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
