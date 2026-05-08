/**
 * FFmpeg Local Configuration
 * تكوين FFmpeg للعمل محلياً بدون الاتصال بالإنترنت
 * جميع الملفات محفوظة محلياً في client/public/ffmpeg/
 */

export const FFmpegConfig = {
  // مسارات الملفات المحلية فقط - بدون fallback للإنترنت
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
  // مسارات الملفات المحلية فقط
  gifPath: '/ffmpeg/gif.min.js',
  workerPath: '/ffmpeg/gif.worker.js',
  
  // إعدادات GIF
  workers: 2,
  quality: 10,
  workerScript: '/ffmpeg/gif.worker.js',
};

/**
 * تحميل FFmpeg محلياً مع إعادة محاولة محسّنة
 * يستخدم المسارات المحلية فقط - بدون اعتماد على الإنترنت
 */
export async function loadFFmpegLocal() {
  try {
    console.log('[FFmpeg] Starting FFmpeg load process (Local Only)...');
    
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
          
          console.log('[FFmpeg] Loading FFmpeg with local paths only...');
          
          // تحميل FFmpeg مع المسارات المحلية فقط
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          
          try {
            await ffmpeg.load({
              coreURL: `${baseUrl}${FFmpegConfig.corePath}`,
              wasmURL: `${baseUrl}${FFmpegConfig.wasmPath}`,
              workerURL: `${baseUrl}${FFmpegConfig.workerPath}`,
            });
            
            console.log('[FFmpeg] FFmpeg loaded successfully with local paths');
            return { ffmpeg, fetchFile };
          } catch (loadError) {
            console.error('[FFmpeg] Failed to load with local paths:', loadError);
            throw new Error(`Failed to load FFmpeg from local paths: ${loadError}`);
          }
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
      console.log('[FFmpeg] Using createFFmpeg approach with local paths...');
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      try {
        const ffmpeg = FFmpegLib.createFFmpeg({
          log: true,
          corePath: `${baseUrl}${FFmpegConfig.corePath}`,
        });
        
        if (!ffmpeg.isLoaded()) {
          try {
            await ffmpeg.load();
            const fetchFile = FFmpegLib.fetchFile;
            console.log('[FFmpeg] FFmpeg loaded via createFFmpeg with local paths');
            return { ffmpeg, fetchFile };
          } catch (e) {
            console.error('[FFmpeg] createFFmpeg load failed with local paths:', e);
            throw new Error(`Failed to load FFmpeg via createFFmpeg: ${e}`);
          }
        }
        
        const fetchFile = FFmpegLib.fetchFile;
        console.log('[FFmpeg] FFmpeg loaded via createFFmpeg');
        return { ffmpeg, fetchFile };
      } catch (createError) {
        console.error('[FFmpeg] createFFmpeg approach failed:', createError);
        throw createError;
      }
    }
    
    throw new Error('FFmpeg libraries not available - ensure all files are in client/public/ffmpeg/');
  } catch (error) {
    console.error('[FFmpeg Load Error]', error);
    throw error;
  }
}

/**
 * تحميل GIF محلياً مع إعادة محاولة محسّنة
 * يستخدم المسارات المحلية فقط
 */
export async function loadGifLocal() {
  try {
    console.log('[GIF] Starting GIF load process (Local Only)...');
    
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
    
    throw new Error('GIF library not available - ensure gif.min.js is in client/public/ffmpeg/');
  } catch (error) {
    console.error('[GIF Load Error]', error);
    throw error;
  }
}

/**
 * التحقق من توفر جميع ملفات FFmpeg محلياً
 */
export async function verifyFFmpegFiles(): Promise<boolean> {
  try {
    const files = [
      '/ffmpeg/ffmpeg-core.js',
      '/ffmpeg/ffmpeg-core.wasm',
      '/ffmpeg/ffmpeg-core.worker.js',
      '/ffmpeg/gif.min.js',
      '/ffmpeg/gif.worker.js',
    ];
    
    console.log('[FFmpeg] Verifying local files...');
    
    for (const file of files) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`[FFmpeg] File not found: ${file}`);
          return false;
        }
        console.log(`[FFmpeg] ✓ Found: ${file}`);
      } catch (error) {
        console.warn(`[FFmpeg] Failed to verify ${file}:`, error);
        return false;
      }
    }
    
    console.log('[FFmpeg] All files verified successfully!');
    return true;
  } catch (error) {
    console.error('[FFmpeg Verification Error]', error);
    return false;
  }
}
