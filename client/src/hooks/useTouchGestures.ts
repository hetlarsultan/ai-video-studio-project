import { useEffect, useRef, useState } from 'react';

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export interface TouchGestureConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  longPressDuration?: number;
  doubleTapDelay?: number;
  enabled?: boolean;
}

const DEFAULT_CONFIG: TouchGestureConfig = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  longPressDuration: 500,
  doubleTapDelay: 300,
  enabled: true,
};

/**
 * Hook لمعالجة إيماءات اللمس على الهواتف الذكية
 * يدعم: Swipe, Double Tap, Long Press
 */
export function useTouchGestures(
  handlers: TouchGestureHandlers,
  config: TouchGestureConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (!mergedConfig.enabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setIsLongPressing(false);

    // تعيين مهلة الضغط الطويل
    longPressTimeoutRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        setIsLongPressing(true);
        handlers.onLongPress?.();
      }
    }, mergedConfig.longPressDuration);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!mergedConfig.enabled || !touchStartRef.current) return;

    // إلغاء مهلة الضغط الطويل
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // تجاهل الحركات الطويلة جداً (احتمال أنها ليست إيماءة)
    if (deltaTime > (mergedConfig.maxSwipeTime ?? 300) && !isLongPressing) {
      touchStartRef.current = null;
      return;
    }

    // معالجة التمرير الأفقي
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > (mergedConfig.minSwipeDistance ?? 50)) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    }
    // معالجة التمرير الرأسي
    else if (Math.abs(deltaY) > (mergedConfig.minSwipeDistance ?? 50)) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
    // معالجة الضغط المزدوج
    else if (deltaX === 0 && deltaY === 0 && deltaTime < 200) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < (mergedConfig.doubleTapDelay ?? 300)) {
        handlers.onDoubleTap?.();
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
      }
    }

    touchStartRef.current = null;
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    if (!mergedConfig.enabled || isLongPressing) return;

    // إلغاء الضغط الطويل إذا تحرك المستخدم
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      setIsLongPressing(false);
    }
  };

  useEffect(() => {
    if (!mergedConfig.enabled) return;

    document.addEventListener('touchstart', handleTouchStart as any);
    document.addEventListener('touchend', handleTouchEnd as any);
    document.addEventListener('touchmove', handleTouchMove as any);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart as any);
      document.removeEventListener('touchend', handleTouchEnd as any);
      document.removeEventListener('touchmove', handleTouchMove as any);
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [mergedConfig.enabled, isLongPressing, handlers]);

  return {
    isLongPressing,
  };
}
