import { useEffect, useState } from 'react';

/**
 * Hook لتحسين الأداء على الأجهزة المحمولة
 * يقلل استهلاك الذاكرة والبطارية
 */
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('large');

  useEffect(() => {
    // التحقق من أن الجهاز محمول
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobileDevice);
    };

    // التحقق من وضع توفير الطاقة
    const checkLowPowerMode = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setIsLowPowerMode(battery.level < 0.2);
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };

    // تحديد حجم الشاشة
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setScreenSize('small');
      } else if (width < 768) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    checkMobile();
    checkLowPowerMode();
    updateScreenSize();

    // الاستماع لتغييرات حجم الشاشة
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // تقليل جودة الفيديو على الأجهزة المحمولة
  const getOptimalVideoQuality = () => {
    if (isLowPowerMode || screenSize === 'small') {
      return 'low'; // 360p
    }
    if (screenSize === 'medium') {
      return 'medium'; // 720p
    }
    return 'high'; // 1080p
  };

  // تقليل عدد الإطارات في الثانية
  const getOptimalFrameRate = () => {
    if (isLowPowerMode || screenSize === 'small') {
      return 24;
    }
    if (screenSize === 'medium') {
      return 30;
    }
    return 60;
  };

  // تقليل استهلاك الذاكرة
  const getOptimalMemory = () => {
    if (isLowPowerMode || screenSize === 'small') {
      return 64 * 1024 * 1024; // 64 MB
    }
    if (screenSize === 'medium') {
      return 128 * 1024 * 1024; // 128 MB
    }
    return 256 * 1024 * 1024; // 256 MB
  };

  // تحسين الأداء بتقليل الرسوميات
  const shouldReduceAnimations = () => {
    return isLowPowerMode || screenSize === 'small';
  };

  // تقليل عدد الطلبات المتزامنة
  const getMaxConcurrentRequests = () => {
    if (isLowPowerMode || screenSize === 'small') {
      return 1;
    }
    if (screenSize === 'medium') {
      return 2;
    }
    return 4;
  };

  return {
    isMobile,
    isLowPowerMode,
    screenSize,
    getOptimalVideoQuality,
    getOptimalFrameRate,
    getOptimalMemory,
    shouldReduceAnimations,
    getMaxConcurrentRequests,
  };
}
