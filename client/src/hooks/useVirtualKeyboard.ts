import { useState, useEffect, useCallback } from 'react';

interface VirtualKeyboardInfo {
  isOpen: boolean;
  height: number;
  visualViewportHeight: number;
  windowHeight: number;
  keyboardHeight: number;
  isVisible: boolean;
}

/**
 * Hook useVirtualKeyboard يراقب فتح/إغلاق لوحة المفاتيح الافتراضية
 * يوفر معلومات عن ارتفاع الكيبورد والشاشة المرئية
 */
export const useVirtualKeyboard = (): VirtualKeyboardInfo => {
  const [info, setInfo] = useState<VirtualKeyboardInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isOpen: false,
        height: 0,
        visualViewportHeight: 0,
        windowHeight: 0,
        keyboardHeight: 0,
        isVisible: false,
      };
    }

    return getKeyboardInfo();
  });

  const updateKeyboardInfo = useCallback(() => {
    setInfo(getKeyboardInfo());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateKeyboardInfo);
    window.addEventListener('orientationchange', updateKeyboardInfo);

    // Monitor visualViewport changes
    if ('visualViewport' in window) {
      (window.visualViewport as VisualViewport).addEventListener('resize', updateKeyboardInfo);
      (window.visualViewport as VisualViewport).addEventListener('scroll', updateKeyboardInfo);
    }

    return () => {
      window.removeEventListener('resize', updateKeyboardInfo);
      window.removeEventListener('orientationchange', updateKeyboardInfo);

      if ('visualViewport' in window) {
        (window.visualViewport as VisualViewport).removeEventListener('resize', updateKeyboardInfo);
        (window.visualViewport as VisualViewport).removeEventListener('scroll', updateKeyboardInfo);
      }
    };
  }, [updateKeyboardInfo]);

  return info;
};

/**
 * Helper function لحساب معلومات لوحة المفاتيح
 */
function getKeyboardInfo(): VirtualKeyboardInfo {
  if (typeof window === 'undefined') {
    return {
      isOpen: false,
      height: 0,
      visualViewportHeight: 0,
      windowHeight: 0,
      keyboardHeight: 0,
      isVisible: false,
    };
  }

  const windowHeight = window.innerHeight;
  const visualViewportHeight = 'visualViewport' in window ? (window.visualViewport as VisualViewport).height : windowHeight;

  // حساب ارتفاع لوحة المفاتيح
  const keyboardHeight = Math.max(0, windowHeight - visualViewportHeight);
  const isOpen = keyboardHeight > 0;

  // التحقق من رؤية الكيبورد (أكثر من 50px)
  const isVisible = keyboardHeight > 50;

  return {
    isOpen,
    height: keyboardHeight,
    visualViewportHeight,
    windowHeight,
    keyboardHeight,
    isVisible,
  };
}

/**
 * Hook useKeyboardHeight للحصول على ارتفاع لوحة المفاتيح فقط
 */
export const useKeyboardHeight = (): number => {
  const info = useVirtualKeyboard();
  return info.keyboardHeight;
};

/**
 * Hook useKeyboardOpen للتحقق من فتح لوحة المفاتيح
 */
export const useKeyboardOpen = (): boolean => {
  const info = useVirtualKeyboard();
  return info.isOpen;
};

/**
 * Hook useKeyboardVisible للتحقق من رؤية لوحة المفاتيح
 */
export const useKeyboardVisible = (): boolean => {
  const info = useVirtualKeyboard();
  return info.isVisible;
};

/**
 * Hook useScrollIntoView لتمرير العنصر إلى الرؤية عند فتح الكيبورد
 */
export const useScrollIntoView = (ref: React.RefObject<HTMLElement>) => {
  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    if (!ref.current || keyboardHeight === 0) return;

    // تأخير قليل للسماح للكيبورد بالظهور
    const timer = setTimeout(() => {
      if (ref.current) {
        const element = ref.current;
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight - keyboardHeight;

        // إذا كان العنصر خارج الرؤية
        if (elementRect.bottom > viewportHeight) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [keyboardHeight, ref]);
};

/**
 * Hook usePaddingForKeyboard لإضافة padding عند فتح الكيبورد
 */
export const usePaddingForKeyboard = () => {
  const keyboardHeight = useKeyboardHeight();

  return {
    paddingBottom: keyboardHeight > 0 ? keyboardHeight + 16 : 0,
    marginBottom: keyboardHeight > 0 ? keyboardHeight + 16 : 0,
  };
};
