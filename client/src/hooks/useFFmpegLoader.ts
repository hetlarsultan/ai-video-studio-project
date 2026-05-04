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
  const { setIsFFmpegReady, connectionStatus, setLoadingProgress, setLoadingMessage } = useConnection();
  const ffmpegRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const loadFFmpeg = useCallback(async () => {
    if (loadingRef.current || ffmpegRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoadingProgress(0);
    setLoadingMessage('جاري تحميل النظام...');

    try {
      if (useLocal) {
        // تحديث التقدم: 10%
        setLoadingProgress(10);
        setLoadingMessage('جاري تحميل مكتبات FFmpeg...');

        // تحميل FFmpeg محلياً
        const { ffmpeg, fetchFile } = await loadFFmpegLocal();
        ffmpegRef.current = { ffmpeg, fetchFile };

        // تحديث التقدم: 90%
        setLoadingProgress(90);
        setLoadingMessage('جاري إنهاء التهيئة...');
      } else {
        // تحديث التقدم: 10%
        setLoadingProgress(10);
        setLoadingMessage('جاري تحميل FFmpeg من CDN...');

        // تحميل FFmpeg من CDN (الطريقة القديمة)
        const FFmpeg = (window as any).FFmpeg?.FFmpeg;
        const fetchFile = (window as any).FFmpeg?.fetchFile;

        if (!FFmpeg || !fetchFile) {
          throw new Error('FFmpeg libraries not loaded');
        }

        // تحديث التقدم: 50%
        setLoadingProgress(50);
        setLoadingMessage('جاري تحميل FFmpeg...');

        const ffmpeg = new FFmpeg();
        await ffmpeg.load();
        ffmpegRef.current = { ffmpeg, fetchFile };

        // تحديث التقدم: 90%
        setLoadingProgress(90);
        setLoadingMessage('جاري إنهاء التهيئة...');
      }

      // تحديث التقدم: 100%
      setLoadingProgress(100);
      setLoadingMessage('تم التحميل بنجاح!');
      setIsFFmpegReady(true);
      onReady?.();

      // إخفاء شريط التقدم بعد ثانية
      setTimeout(() => {
        setLoadingProgress(0);
      }, 1000);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[FFmpeg Loader Error]', err);
      setLoadingProgress(0);
      setLoadingMessage('حدث خطأ في التحميل');
      onError?.(err);
      setIsFFmpegReady(false);
    } finally {
      loadingRef.current = false;
    }
  }, [setIsFFmpegReady, onReady, onError, useLocal, setLoadingProgress, setLoadingMessage]);

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
