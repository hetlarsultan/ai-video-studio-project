import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useVirtualKeyboard,
  useKeyboardHeight,
  useKeyboardOpen,
  useKeyboardVisible,
  usePaddingForKeyboard,
} from './useVirtualKeyboard';

describe('useVirtualKeyboard', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Mock visualViewport
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: {
        height: 800,
        width: 375,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with keyboard closed', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it('should have correct window height', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    expect(result.current.windowHeight).toBe(800);
  });

  it('should have correct visual viewport height', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    expect(result.current.visualViewportHeight).toBe(800);
  });

  it('should detect keyboard open when viewport height decreases', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.keyboardHeight).toBe(300);
  });

  it('should calculate keyboard height correctly', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.keyboardHeight).toBe(400);
  });

  it('should detect keyboard visible when height > 50px', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 700,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.keyboardHeight).toBe(100);
  });

  it('should not detect keyboard visible when height < 50px', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 760,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(40);
  });

  it('should handle keyboard close', () => {
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });
});

describe('useKeyboardHeight', () => {
  it('should return keyboard height', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    expect(typeof result.current).toBe('number');
    expect(result.current).toBeGreaterThanOrEqual(0);
  });
});

describe('useKeyboardOpen', () => {
  it('should return keyboard open status', () => {
    const { result } = renderHook(() => useKeyboardOpen());

    expect(typeof result.current).toBe('boolean');
  });
});

describe('useKeyboardVisible', () => {
  it('should return keyboard visible status', () => {
    const { result } = renderHook(() => useKeyboardVisible());

    expect(typeof result.current).toBe('boolean');
  });
});

describe('usePaddingForKeyboard', () => {
  it('should return padding object', () => {
    const { result } = renderHook(() => usePaddingForKeyboard());

    expect(result.current).toHaveProperty('paddingBottom');
    expect(result.current).toHaveProperty('marginBottom');
    expect(typeof result.current.paddingBottom).toBe('number');
    expect(typeof result.current.marginBottom).toBe('number');
  });

  it('should return zero padding when keyboard closed', () => {
    const { result } = renderHook(() => usePaddingForKeyboard());

    expect(result.current.paddingBottom).toBe(0);
    expect(result.current.marginBottom).toBe(0);
  });

  it('should add padding when keyboard open', () => {
    const { result } = renderHook(() => usePaddingForKeyboard());

    act(() => {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.paddingBottom).toBeGreaterThan(0);
    expect(result.current.marginBottom).toBeGreaterThan(0);
  });
});
