import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type, 
  duration = 4000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
          icon: <CheckCircle className="w-5 h-5" />,
          border: 'border-emerald-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: <AlertCircle className="w-5 h-5" />,
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          border: 'border-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          icon: <Info className="w-5 h-5" />,
          border: 'border-blue-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        toast-notification
        ${styles.bg}
        border-l-4 ${styles.border}
        text-white
        px-6 py-4
        rounded-lg
        shadow-xl
        flex items-center gap-4
        animate-slideInRight
        backdrop-blur-sm
        bg-opacity-95
      `}
      role="alert"
    >
      <div className="flex-shrink-0 text-white">
        {styles.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="
          flex-shrink-0
          text-white
          hover:text-gray-200
          transition-colors
          duration-200
        "
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
