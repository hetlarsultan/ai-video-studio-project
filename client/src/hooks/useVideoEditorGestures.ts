import { useCallback, useRef, useState } from 'react';
import { useTouchGestures } from './useTouchGestures';

export interface VideoEditorGestureActions {
  onNextStep?: () => void;
  onPreviousStep?: () => void;
  onPlayPause?: () => void;
  onMuteUnmute?: () => void;
  onResetVideo?: () => void;
  onExportVideo?: () => void;
}

export interface VideoEditorGestureConfig {
  enableSwipe?: boolean;
  enableDoubleTap?: boolean;
  enableLongPress?: boolean;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  longPressDuration?: number;
}

const DEFAULT_CONFIG: VideoEditorGestureConfig = {
  enableSwipe: true,
  enableDoubleTap: true,
  enableLongPress: true,
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  longPressDuration: 500,
};

/**
 * Hook لربط إيماءات اللمس مع عمليات محرر الفيديو
 */
export function useVideoEditorGestures(
  actions: VideoEditorGestureActions,
  config: VideoEditorGestureConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [lastGestureTime, setLastGestureTime] = useState<number>(0);
  const gestureDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // دالة مساعدة لتجنب تكرار الإيماءات
  const debounceGesture = useCallback(
    (callback: (() => void) | undefined, delay: number = 300) => {
      if (!callback) return;

      const now = Date.now();
      if (now - lastGestureTime < delay) {
        return; // تجاهل الإيماءة المتكررة
      }

      if (gestureDebounceRef.current) {
        clearTimeout(gestureDebounceRef.current);
      }

      gestureDebounceRef.current = setTimeout(() => {
        callback();
        setLastGestureTime(Date.now());
      }, 50);
    },
    [lastGestureTime]
  );

  // معالجات الإيماءات
  const handleSwipeLeft = useCallback(() => {
    if (mergedConfig.enableSwipe) {
      debounceGesture(actions.onNextStep);
    }
  }, [mergedConfig.enableSwipe, actions.onNextStep, debounceGesture]);

  const handleSwipeRight = useCallback(() => {
    if (mergedConfig.enableSwipe) {
      debounceGesture(actions.onPreviousStep);
    }
  }, [mergedConfig.enableSwipe, actions.onPreviousStep, debounceGesture]);

  const handleSwipeUp = useCallback(() => {
    if (mergedConfig.enableSwipe) {
      debounceGesture(actions.onMuteUnmute);
    }
  }, [mergedConfig.enableSwipe, actions.onMuteUnmute, debounceGesture]);

  const handleSwipeDown = useCallback(() => {
    if (mergedConfig.enableSwipe) {
      debounceGesture(actions.onResetVideo);
    }
  }, [mergedConfig.enableSwipe, actions.onResetVideo, debounceGesture]);

  const handleDoubleTap = useCallback(() => {
    if (mergedConfig.enableDoubleTap) {
      debounceGesture(actions.onPlayPause);
    }
  }, [mergedConfig.enableDoubleTap, actions.onPlayPause, debounceGesture]);

  const handleLongPress = useCallback(() => {
    if (mergedConfig.enableLongPress) {
      debounceGesture(actions.onExportVideo);
    }
  }, [mergedConfig.enableLongPress, actions.onExportVideo, debounceGesture]);

  // استخدام Hook الإيماءات
  useTouchGestures(
    {
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
      onSwipeUp: handleSwipeUp,
      onSwipeDown: handleSwipeDown,
      onDoubleTap: handleDoubleTap,
      onLongPress: handleLongPress,
    },
    {
      minSwipeDistance: mergedConfig.minSwipeDistance,
      maxSwipeTime: mergedConfig.maxSwipeTime,
      longPressDuration: mergedConfig.longPressDuration,
      enabled: true,
    }
  );

  return {
    lastGestureTime,
  };
}
