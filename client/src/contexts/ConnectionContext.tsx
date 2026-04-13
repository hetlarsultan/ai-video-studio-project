import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConnectionContextType {
  isOnline: boolean;
  isFFmpegReady: boolean;
  connectionStatus: 'online' | 'offline' | 'loading';
  setIsOnline: (value: boolean) => void;
  setIsFFmpegReady: (value: boolean) => void;
  setConnectionStatus: (status: 'online' | 'offline' | 'loading') => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setConnectionStatus('online');
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setConnectionStatus('offline');
  }, []);

  React.useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // تحديد الحالة الأولية
    setIsOnline(navigator.onLine);
    setConnectionStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const value: ConnectionContextType = {
    isOnline,
    isFFmpegReady,
    connectionStatus,
    setIsOnline,
    setIsFFmpegReady,
    setConnectionStatus,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
