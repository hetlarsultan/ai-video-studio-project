import React from 'react';
import { useConnection } from '@/contexts/ConnectionContext';

interface ProgressBarProps {
  progress?: number;
  isVisible?: boolean;
  label?: string;
  animated?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress: customProgress,
  isVisible: customIsVisible,
  label: customLabel,
  animated = true,
  variant = 'primary',
  showPercentage = true,
}) => {
  const { connectionStatus, loadingProgress, loadingMessage, isFFmpegReady } = useConnection();

  const progress = customProgress !== undefined ? customProgress : loadingProgress;
  const isVisible = customIsVisible !== undefined ? customIsVisible : !(connectionStatus === 'online' && isFFmpegReady);
  const label = customLabel || loadingMessage;

  if (!isVisible) {
    return null;
  }

  const variantColors = {
    primary: 'from-cyan-500 via-blue-500 to-purple-600',
    secondary: 'from-blue-500 via-purple-500 to-pink-600',
    success: 'from-emerald-500 to-teal-600',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-200">{label}</label>
          {showPercentage && (
            <span className="text-xs font-medium text-cyan-400">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}

      <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${variantColors[variant]} transition-all duration-300 ease-out rounded-full ${
            animated && clampedProgress > 0 ? 'animate-pulse-glow' : ''
          }`}
          style={{
            width: `${clampedProgress}%`,
          }}
        >
          {animated && clampedProgress > 0 && clampedProgress < 100 && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      {clampedProgress === 100 && (
        <div className="text-xs text-emerald-400 font-medium animate-fadeIn">
          ✓ اكتمل بنسبة 100%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
