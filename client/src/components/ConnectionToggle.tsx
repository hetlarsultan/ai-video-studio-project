import React from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ConnectionToggle: React.FC = () => {
  const { connectionStatus, isFFmpegReady } = useConnection();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'loading':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'متصل بالإنترنت';
      case 'offline':
        return 'غير متصل';
      case 'loading':
        return 'جاري التحميل...';
      default:
        return 'غير معروف';
    }
  };

  const getIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <Wifi className="w-4 h-4" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 ${getStatusColor()}`}>
        {getIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {isFFmpegReady && (
          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            FFmpeg جاهز
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionToggle;
