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
  maxMemory: 64 * 1024 * 1024, // 64 MB - تقليل عدواني للذاكرة لتجنب مشاكل WebAssembly
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
 * تحميل FFmpeg محلياً مع إعادة محاولة محسّنة
 */
export async function loadFFmpegLocal() {
  try {
    console.log('[FFmpeg] Starting FFmpeg load process...');
    
    // الانتظار لتحميل السكريبتات
    let retries = 0;
    const maxRetries = 30;
    const retryDelay = 200;
    
    while (retries < maxRetries) {
      try {
        // محاولة الوصول إلى FFmpeg من window أو self
        let FFmpegLib = (window as any).FFmpeg;
        
        // إذا لم نجد FFmpeg، حاول self
        if (!FFmpegLib) {
          FFmpegLib = (self as any).FFmpeg;
        }
        
        // تحقق من وجود FFmpeg و fetchFile
        if (FFmpegLib && FFmpegLib.FFmpeg && FFmpegLib.fetchFile) {
          console.log('[FFmpeg] Libraries loaded successfully on retry', retries);
          
          const { FFmpeg, fetchFile } = FFmpegLib;
          const ffmpeg = new FFmpeg();
          
          console.log('[FFmpeg] Loading FFmpeg with local paths...');
          
          // تحميل FFmpeg مع المسارات المحلية
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          try {
            await ffmpeg.load({
              coreURL: `${baseUrl}${FFmpegConfig.corePath}`,
              wasmURL: `${baseUrl}${FFmpegConfig.wasmPath}`,
              workerURL: `${baseUrl}${FFmpegConfig.workerPath}`,
            });
          } catch (loadError) {
            console.warn('[FFmpeg] Failed to load with custom paths, trying default...', loadError);
            // حاول بدون المسارات المخصصة
            await ffmpeg.load();
          }

          console.log('[FFmpeg] FFmpeg loaded successfully');
          return { ffmpeg, fetchFile };
        }
      } catch (innerError) {
        console.warn(`[FFmpeg] Retry ${retries} failed:`, innerError);
      }
      
      // الانتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
      
      if (retries % 5 === 0) {
        console.log(`[FFmpeg] Retry ${retries}/${maxRetries} - waiting for libraries...`);
      }
    }
    
    // إذا فشلنا بعد كل المحاولات، حاول طريقة بديلة
    console.warn('[FFmpeg] Standard loading failed, trying alternative approach...');
    
    // حاول استخدام createFFmpeg مباشرة إذا كان متاحاً
    const FFmpegLib = (window as any).FFmpeg || (self as any).FFmpeg;
    if (FFmpegLib && FFmpegLib.createFFmpeg) {
      console.log('[FFmpeg] Using createFFmpeg approach...');
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      try {
        const ffmpeg = FFmpegLib.createFFmpeg({
          log: true,
          corePath: `${baseUrl}${FFmpegConfig.corePath}`,
        });
        
        if (!ffmpeg.isLoaded()) {
          try {
            await ffmpeg.load();
          } catch (e) {
            console.warn('[FFmpeg] createFFmpeg load failed with custom paths, trying default...', e);
            // Try with default paths
            const ffmpeg2 = FFmpegLib.createFFmpeg({
              log: true,
            });
            await ffmpeg2.load();
            const fetchFile = FFmpegLib.fetchFile;
            console.log('[FFmpeg] FFmpeg loaded with default paths');
            return { ffmpeg: ffmpeg2, fetchFile };
          }
        }
        
        const fetchFile = FFmpegLib.fetchFile;
        console.log('[FFmpeg] FFmpeg loaded via createFFmpeg');
        return { ffmpeg, fetchFile };
      } catch (createError) {
        console.error('[FFmpeg] createFFmpeg approach failed:', createError);
      }
    }
    
    throw new Error('FFmpeg libraries not available after all retries');
  } catch (error) {
    console.error('[FFmpeg Load Error]', error);
    throw error;
  }
}

/**
 * تحميل GIF محلياً مع إعادة محاولة محسّنة
 */
export async function loadGifLocal() {
  try {
    console.log('[GIF] Starting GIF load process...');
    
    // الانتظار لتحميل السكريبتات
    let retries = 0;
    const maxRetries = 20;
    const retryDelay = 200;
    
    while (retries < maxRetries) {
      try {
        const GIF = (window as any).GIF || (self as any).GIF;

        if (GIF) {
          console.log('[GIF] Library loaded successfully on retry', retries);
          return GIF;
        }
      } catch (innerError) {
        console.warn(`[GIF] Retry ${retries} failed:`, innerError);
      }
      
      // الانتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retries++;
      
      if (retries % 5 === 0) {
        console.log(`[GIF] Retry ${retries}/${maxRetries} - waiting for library...`);
      }
    }
    
    throw new Error('GIF library not available after retries');
  } catch (error) {
    console.error('[GIF Load Error]', error);
    throw error;
  }
}
