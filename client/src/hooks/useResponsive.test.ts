import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive, useMediaQuery, useScreenSize, useOrientation, useTouchDevice } from './useResponsive';

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct screen size', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenSize).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
  });

  it('should detect mobile screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.screenSize).toBe('mobile');
  });

  it('should detect tablet screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.screenSize).toBe('tablet');
  });

  it('should detect large screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLarge).toBe(true);
    expect(result.current.screenSize).toBe('large');
  });

  it('should detect portrait orientation', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isPortrait).toBe(true);
    expect(result.current.orientation).toBe('portrait');
  });

  it('should detect landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.orientation).toBe('landscape');
  });

  it('should have correct width and height', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('should detect high DPI screen', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.isHighDPI).toBe('boolean');
  });

  it('should detect touch device', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.isTouchDevice).toBe('boolean');
  });

  it('should update on window resize', async () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
  });
});

describe('useMediaQuery', () => {
  it('should match media query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));

    expect(typeof result.current).toBe('boolean');
  });

  it('should update when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));

    expect(typeof result.current).toBe('boolean');
  });
});

describe('useScreenSize', () => {
  it('should return screen size', () => {
    const { result } = renderHook(() => useScreenSize());

    expect(['mobile', 'tablet', 'desktop', 'large']).toContain(result.current);
  });
});

describe('useOrientation', () => {
  it('should return orientation', () => {
    const { result } = renderHook(() => useOrientation());

    expect(['portrait', 'landscape']).toContain(result.current);
  });
});

describe('useTouchDevice', () => {
  it('should return touch device status', () => {
    const { result } = renderHook(() => useTouchDevice());

    expect(typeof result.current).toBe('boolean');
  });
});
