import { useEffect, useRef, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';

interface FFmpegLoaderOptions {
  onReady?: () => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

export const useFFmpegLoader = (options: FFmpegLoaderOptions = {}) => {
  const { autoLoad = true, onReady, onError } = options;
  const { setIsFFmpegReady, connectionStatus } = useConnection();
  const ffmpegRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const loadFFmpeg = useCallback(async () => {
    if (loadingRef.current || ffmpegRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      // محاولة تحميل FFmpeg من CDN
      const FFmpeg = (window as any).FFmpeg?.FFmpeg;
      const fetchFile = (window as any).FFmpeg?.fetchFile;

      if (!FFmpeg || !fetchFile) {
        throw new Error('FFmpeg libraries not loaded');
      }

      const ffmpeg = new FFmpeg();
      
      // تحميل FFmpeg
      await ffmpeg.load();
      
      ffmpegRef.current = ffmpeg;
      setIsFFmpegReady(true);
      onReady?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[FFmpeg Loader Error]', err);
      onError?.(err);
      setIsFFmpegReady(false);
    } finally {
      loadingRef.current = false;
    }
  }, [setIsFFmpegReady, onReady, onError]);

  useEffect(() => {
    if (autoLoad && connectionStatus === 'online') {
      loadFFmpeg();
    }
  }, [autoLoad, connectionStatus, loadFFmpeg]);

  const unloadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) {
      try {
        await ffmpegRef.current.deleteFile('*');
        ffmpegRef.current = null;
        setIsFFmpegReady(false);
      } catch (error) {
        console.error('[FFmpeg Unload Error]', error);
      }
    }
  }, [setIsFFmpegReady]);

  return {
    ffmpeg: ffmpegRef.current,
    loadFFmpeg,
    unloadFFmpeg,
  };
};
