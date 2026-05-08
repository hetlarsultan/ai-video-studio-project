import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FFmpegConfig, GifConfig, verifyFFmpegFiles } from './ffmpegConfig';

describe('FFmpegConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct local paths', () => {
    expect(FFmpegConfig.corePath).toBe('/ffmpeg/ffmpeg-core.js');
    expect(FFmpegConfig.wasmPath).toBe('/ffmpeg/ffmpeg-core.wasm');
    expect(FFmpegConfig.workerPath).toBe('/ffmpeg/ffmpeg-core.worker.js');
  });

  it('should have correct memory configuration', () => {
    expect(FFmpegConfig.maxMemory).toBe(64 * 1024 * 1024);
  });

  it('should have logging enabled', () => {
    expect(FFmpegConfig.log).toBe(true);
    expect(typeof FFmpegConfig.logger).toBe('function');
  });

  it('should have correct timeout', () => {
    expect(FFmpegConfig.timeout).toBe(30000);
  });

  it('should log messages correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    FFmpegConfig.logger('Test message');
    expect(consoleSpy).toHaveBeenCalledWith('[FFmpeg]', 'Test message');
  });
});

describe('GifConfig', () => {
  it('should have correct local paths', () => {
    expect(GifConfig.gifPath).toBe('/ffmpeg/gif.min.js');
    expect(GifConfig.workerPath).toBe('/ffmpeg/gif.worker.js');
    expect(GifConfig.workerScript).toBe('/ffmpeg/gif.worker.js');
  });

  it('should have correct worker configuration', () => {
    expect(GifConfig.workers).toBe(2);
    expect(GifConfig.quality).toBe(10);
  });
});

describe('verifyFFmpegFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify all required files', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
    });
    global.fetch = mockFetch;

    const result = await verifyFFmpegFiles();
    
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it('should return false if any file is missing', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });
    global.fetch = mockFetch;

    const result = await verifyFFmpegFiles();
    
    expect(result).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const result = await verifyFFmpegFiles();
    
    expect(result).toBe(false);
  });

  it('should verify files in correct order', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await verifyFFmpegFiles();
    
    const expectedFiles = [
      '/ffmpeg/ffmpeg-core.js',
      '/ffmpeg/ffmpeg-core.wasm',
      '/ffmpeg/ffmpeg-core.worker.js',
      '/ffmpeg/gif.min.js',
      '/ffmpeg/gif.worker.js',
    ];
    
    expectedFiles.forEach((file, index) => {
      expect(mockFetch).toHaveBeenNthCalledWith(index + 1, file, { method: 'HEAD' });
    });
  });
});

describe('FFmpeg Local Configuration', () => {
  it('should not have any internet fallback paths', () => {
    // التحقق من أن جميع المسارات محلية
    expect(FFmpegConfig.corePath).toMatch(/^\/ffmpeg\//);
    expect(FFmpegConfig.wasmPath).toMatch(/^\/ffmpeg\//);
    expect(FFmpegConfig.workerPath).toMatch(/^\/ffmpeg\//);
    
    // التحقق من عدم وجود مسارات من الإنترنت
    expect(FFmpegConfig.corePath).not.toMatch(/http/);
    expect(FFmpegConfig.wasmPath).not.toMatch(/http/);
    expect(FFmpegConfig.workerPath).not.toMatch(/http/);
  });

  it('should have all required files defined', () => {
    const requiredFiles = [
      FFmpegConfig.corePath,
      FFmpegConfig.wasmPath,
      FFmpegConfig.workerPath,
      GifConfig.gifPath,
      GifConfig.workerPath,
    ];
    
    requiredFiles.forEach(file => {
      expect(file).toBeDefined();
      expect(file).toMatch(/^\/ffmpeg\//);
    });
  });
});
