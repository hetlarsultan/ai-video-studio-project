/**
 * FFmpeg Local Configuration
 * تكوين FFmpeg للعمل محلياً بدون الاتصال بالإنترنت
 */

export const FFmpegConfig = {
  // مسارات الملفات المحلية
  corePath: '/ffmpeg/ffmpeg-core.js',
  wasmPath: '/ffmpeg/ffmpeg-core.wasm',
  workerPath: '/ffmpeg/ffmpeg-core.worker.js',
  
  // إعدادات FFmpeg
  log: true,
  logger: (message: any) => {
    console.log('[FFmpeg]', message);
  },
  
  // إعدادات الأداء
  timeout: 30000,
  
  // إعدادات الذاكرة
  maxMemory: 512 * 1024 * 1024, // 512 MB
};

export const GifConfig = {
  // مسارات الملفات المحلية
  gifPath: '/ffmpeg/gif.min.js',
  workerPath: '/ffmpeg/gif.worker.js',
  
  // إعدادات GIF
  workers: 2,
  quality: 10,
  workerScript: '/ffmpeg/gif.worker.js',
};

/**
 * تحميل FFmpeg محلياً
 */
export async function loadFFmpegLocal() {
  try {
    // التحقق من توفر FFmpeg
    const FFmpeg = (window as any).FFmpeg?.FFmpeg;
    const fetchFile = (window as any).FFmpeg?.fetchFile;

    if (!FFmpeg || !fetchFile) {
      throw new Error('FFmpeg libraries not available');
    }

    const ffmpeg = new FFmpeg();
    
    // تحميل FFmpeg مع المسارات المحلية
    await ffmpeg.load({
      coreURL: FFmpegConfig.corePath,
      wasmURL: FFmpegConfig.wasmPath,
      workerURL: FFmpegConfig.workerPath,
    });

    return { ffmpeg, fetchFile };
  } catch (error) {
    console.error('[FFmpeg Load Error]', error);
    throw error;
  }
}

/**
 * تحميل GIF محلياً
 */
export async function loadGifLocal() {
  try {
    // التحقق من توفر GIF.js
    const GIF = (window as any).GIF;

    if (!GIF) {
      throw new Error('GIF library not available');
    }

    return GIF;
  } catch (error) {
    console.error('[GIF Load Error]', error);
    throw error;
  }
}
