import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFFmpeg } from './useFFmpeg';

describe('useFFmpeg Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFFmpeg());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress.progress).toBe(0);
    expect(result.current.progress.status).toBe('جاهز');
  });

  it('should have loadFFmpeg function', () => {
    const { result } = renderHook(() => useFFmpeg());

    expect(typeof result.current.loadFFmpeg).toBe('function');
  });

  it('should have processVideo function', () => {
    const { result } = renderHook(() => useFFmpeg());

    expect(typeof result.current.processVideo).toBe('function');
  });

  it('should have mergeVideos function', () => {
    const { result } = renderHook(() => useFFmpeg());

    expect(typeof result.current.mergeVideos).toBe('function');
  });

  it('should have extractAudio function', () => {
    const { result } = renderHook(() => useFFmpeg());

    expect(typeof result.current.extractAudio).toBe('function');
  });

  it('should return null when processing without loading FFmpeg', async () => {
    const { result } = renderHook(() => useFFmpeg());

    const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });

    let processResult;
    await act(async () => {
      processResult = await result.current.processVideo(mockFile);
    });

    expect(processResult).toBeNull();
  });
});
