import { useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  interval?: number; // milliseconds
  onSave?: (data: unknown) => Promise<void>;
  enabled?: boolean;
}

export function useAutoSave(
  data: unknown,
  options: AutoSaveOptions = {}
) {
  const { interval = 30000, onSave, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<unknown>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (!enabled || isSavingRef.current || !onSave) return;

    // Only save if data has changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return;
    }

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = data;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, enabled, onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, interval);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, interval, enabled, save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Force save before unmounting
      save();
    };
  }, [save]);

  return { save, isSaving: isSavingRef.current };
}
