import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemTheme } from './useSystemTheme';

describe('useSystemTheme', () => {
  beforeEach(() => {
    // مسح localStorage قبل كل اختبار
    localStorage.clear();
    // إعادة تعيين DOM
    document.documentElement.className = '';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with system preference', () => {
    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.mode).toBe('system');
    expect(result.current.systemPreference).toBeDefined();
    expect(result.current.effectiveTheme).toBeDefined();
  });

  it('should load saved theme mode from localStorage', () => {
    localStorage.setItem('themeMode', 'dark');

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.mode).toBe('dark');
  });

  it('should set mode and save to localStorage', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('should update effective theme when mode is dark', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('dark');
    });

    expect(result.current.effectiveTheme).toBe('dark');
  });

  it('should update effective theme when mode is light', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('light');
    });

    expect(result.current.effectiveTheme).toBe('light');
  });

  it('should use system preference when mode is system', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('system');
    });

    expect(result.current.mode).toBe('system');
    expect(result.current.effectiveTheme).toBe(result.current.systemPreference);
  });

  it('should apply theme to DOM', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.applyTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('should apply light theme to DOM', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.applyTheme('light');
    });

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('should add theme-transitioning class during theme change', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.applyTheme('dark');
    });

    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
  });

  it('should get system preference', () => {
    const { result } = renderHook(() => useSystemTheme());

    const preference = result.current.getSystemPreference();
    expect(preference === 'dark' || preference === 'light').toBe(true);
  });

  it('should handle multiple mode changes', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('dark');
    });
    expect(result.current.mode).toBe('dark');

    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.setMode('system');
    });
    expect(result.current.mode).toBe('system');
  });

  it('should persist theme mode across hook instances', () => {
    const { result: result1 } = renderHook(() => useSystemTheme());

    act(() => {
      result1.current.setMode('dark');
    });

    const { result: result2 } = renderHook(() => useSystemTheme());

    expect(result2.current.mode).toBe('dark');
  });

  it('should handle rapid mode changes', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.setMode('dark');
      result.current.setMode('light');
      result.current.setMode('system');
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('should apply theme with smooth transition', () => {
    const { result } = renderHook(() => useSystemTheme());

    act(() => {
      result.current.applyTheme('dark');
    });

    // Check that theme-transitioning class was added
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
  });

  it('should maintain system preference state', () => {
    const { result } = renderHook(() => useSystemTheme());

    const systemPref = result.current.systemPreference;
    
    act(() => {
      result.current.setMode('dark');
    });

    // System preference should not change when manually setting mode
    expect(result.current.systemPreference).toBe(systemPref);
  });

  it('should correctly determine effective theme for each mode', () => {
    const { result } = renderHook(() => useSystemTheme());

    // Test dark mode
    act(() => {
      result.current.setMode('dark');
    });
    expect(result.current.effectiveTheme).toBe('dark');

    // Test light mode
    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.effectiveTheme).toBe('light');

    // Test system mode
    act(() => {
      result.current.setMode('system');
    });
    expect(result.current.effectiveTheme).toBe(result.current.systemPreference);
  });
});
