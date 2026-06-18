import React, { useEffect, useState } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * مكون ResponsiveContainer يوفر حاوية متجاوبة
 * تتكيف مع جميع أحجام الشاشات والأجهزة
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'large'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // تحديد حجم الشاشة
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1440) {
        setScreenSize('desktop');
      } else {
        setScreenSize('large');
      }

      // تحديد الاتجاه
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const containerClasses = `
    responsive-container
    screen-${screenSize}
    orientation-${orientation}
    ${className}
  `.trim();

  return (
    <div
      className={containerClasses}
      data-screen-size={screenSize}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
