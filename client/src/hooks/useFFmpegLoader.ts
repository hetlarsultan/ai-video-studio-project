import { useEffect, useRef, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { loadFFmpegLocal } from '@/lib/ffmpegConfig';

interface FFmpegLoaderOptions {
  onReady?: () => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
  useLocal?: boolean;
}

export const useFFmpegLoader = (options: FFmpegLoaderOptions = {}) => {
  const { autoLoad = true, onReady, onError, useLocal = true } = options;
  const { setIsFFmpegReady, connectionStatus } = useConnection();
  const ffmpegRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const loadFFmpeg = useCallback(async () => {
    if (loadingRef.current || ffmpegRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      if (useLocal) {
        // تحميل FFmpeg محلياً
        const { ffmpeg, fetchFile } = await loadFFmpegLocal();
        ffmpegRef.current = { ffmpeg, fetchFile };
      } else {
        // تحميل FFmpeg من CDN (الطريقة القديمة)
        const FFmpeg = (window as any).FFmpeg?.FFmpeg;
        const fetchFile = (window as any).FFmpeg?.fetchFile;

        if (!FFmpeg || !fetchFile) {
          throw new Error('FFmpeg libraries not loaded');
        }

        const ffmpeg = new FFmpeg();
        await ffmpeg.load();
        ffmpegRef.current = { ffmpeg, fetchFile };
      }

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
  }, [setIsFFmpegReady, onReady, onError, useLocal]);

  useEffect(() => {
    if (autoLoad && (connectionStatus === 'online' || useLocal)) {
      loadFFmpeg();
    }
  }, [autoLoad, connectionStatus, loadFFmpeg, useLocal]);

  const unloadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.ffmpeg) {
      try {
        await ffmpegRef.current.ffmpeg.deleteFile('*');
        ffmpegRef.current = null;
        setIsFFmpegReady(false);
      } catch (error) {
        console.error('[FFmpeg Unload Error]', error);
      }
    }
  }, [setIsFFmpegReady]);

  return {
    ffmpeg: ffmpegRef.current?.ffmpeg,
    fetchFile: ffmpegRef.current?.fetchFile,
    loadFFmpeg,
    unloadFFmpeg,
  };
};
