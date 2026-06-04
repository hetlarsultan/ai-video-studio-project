import React from 'react';

interface LoadingAnimationProps {
  isVisible?: boolean;
  message?: string;
  variant?: 'spinner' | 'pulse' | 'wave' | 'dots';
  size?: 'small' | 'medium' | 'large';
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  isVisible = true,
  message = 'جاري المعالجة...',
  variant = 'spinner',
  size = 'medium',
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const renderAnimation = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full animate-pulse`}></div>
        );

      case 'wave':
        return (
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gradient-to-t from-cyan-500 to-purple-600 rounded-full animate-wave"
                style={{
                  animationDelay: `${i * 0.15}s`,
                }}
              ></div>
            ))}
          </div>
        );

      case 'dots':
        return (
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderAnimation()}
      {message && (
        <p className="text-sm font-medium text-slate-300 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingAnimation;
