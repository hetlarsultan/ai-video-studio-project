import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveInfo {
  screenSize: ScreenSize;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  isTouchDevice: boolean;
  isHighDPI: boolean;
}

/**
 * Hook useResponsive يوفر معلومات الاستجابة والشاشة
 * يتابع التغييرات في حجم الشاشة والاتجاه
 */
export const useResponsive = (): ResponsiveInfo => {
  const [info, setInfo] = useState<ResponsiveInfo>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;

    return {
      screenSize: getScreenSize(width),
      orientation: getOrientation(width, height),
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024 && width < 1440,
      isLarge: width >= 1440,
      isPortrait: width <= height,
      isLandscape: width > height,
      width,
      height,
      isTouchDevice: isTouchDevice(),
      isHighDPI: isHighDPI(),
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setInfo({
        screenSize: getScreenSize(width),
        orientation: getOrientation(width, height),
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLarge: width >= 1440,
        isPortrait: width <= height,
        isLandscape: width > height,
        width,
        height,
        isTouchDevice: isTouchDevice(),
        isHighDPI: isHighDPI(),
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return info;
};

/**
 * Helper function لتحديد حجم الشاشة
 */
function getScreenSize(width: number): ScreenSize {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'large';
}

/**
 * Helper function لتحديد الاتجاه
 */
function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Helper function للتحقق من جهاز اللمس
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    (typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        (navigator && 'maxTouchPoints' in navigator && (navigator.maxTouchPoints as number) > 0))) ||
    (navigator && 'msMaxTouchPoints' in navigator && (navigator.msMaxTouchPoints as number) > 0)
  );
}

/**
 * Helper function للتحقق من شاشة عالية الدقة
 */
function isHighDPI(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    (typeof window !== 'undefined' && window.devicePixelRatio > 1) ||
    (typeof window !== 'undefined' && window.matchMedia('(min-resolution: 192dpi)').matches)
  );
}

/**
 * Hook useMediaQuery للتحقق من media queries محددة
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * Hook useScreenSize للحصول على حجم الشاشة فقط
 */
export const useScreenSize = (): ScreenSize => {
  const info = useResponsive();
  return info.screenSize;
};

/**
 * Hook useOrientation للحصول على الاتجاه فقط
 */
export const useOrientation = (): Orientation => {
  const info = useResponsive();
  return info.orientation;
};

/**
 * Hook useTouchDevice للتحقق من جهاز اللمس
 */
export const useTouchDevice = (): boolean => {
  const info = useResponsive();
  return info.isTouchDevice;
};
