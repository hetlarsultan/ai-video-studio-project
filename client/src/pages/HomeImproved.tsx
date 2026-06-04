import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Film, Wand2, Volume2, AlertCircle, CheckCircle2, Zap, ImageIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useFFmpegLoader } from '@/hooks/useFFmpegLoader';
import { useVideoEditorGestures } from '@/hooks/useVideoEditorGestures';
import FileProcessingCard from '@/components/FileProcessingCard';
import OutputSection from '@/components/OutputSection';

/**
 * AI Video Studio Pro - Enhanced UI Version
 * - Improved design with better component organization
 * - Enhanced user experience with clearer controls
 * - Better visual hierarchy and spacing
 */

export default function HomeImproved() {
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [_currentEditorStep, setCurrentEditorStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // ربط إيماءات اللمس مع عمليات الفيديو
  useVideoEditorGestures(
    {
      onNextStep: () => setCurrentEditorStep(prev => prev + 1),
      onPreviousStep: () => setCurrentEditorStep(prev => Math.max(0, prev - 1)),
      onPlayPause: () => setIsPlaying(!isPlaying),
      onMuteUnmute: () => setIsMuted(!isMuted),
      onResetVideo: () => {
        setCurrentEditorStep(0);
        setIsPlaying(false);
      },
      onExportVideo: () => {
        setMessage({ type: 'success', text: 'جاري تصدير الفيديو...' });
      },
    },
    {
      enableSwipe: true,
      enableDoubleTap: true,
      enableLongPress: true,
    }
  );

  // حالات المعاينة

  const textToVideoRef = useRef<HTMLTextAreaElement>(null);
  const imagesToVideoRef = useRef<HTMLInputElement>(null);
  const imagesToGifRef = useRef<HTMLInputElement>(null);
  const textToSpeechRef = useRef<HTMLTextAreaElement>(null);
  const videoOutputRef = useRef<HTMLVideoElement>(null);
  const videoFromImagesRef = useRef<HTMLVideoElement>(null);
  const gifOutputRef = useRef<HTMLImageElement>(null);

  const ffmpegRef = useRef<any>(null);

  // استخدام FFmpeg محلياً
  useFFmpegLoader({
    useLocal: true,
    onReady: () => setFfmpegReady(true),
    onError: (error) => {
      console.error('FFmpeg Error:', error);
      setMessage({ type: 'error', text: 'خطأ في تحميل FFmpeg' });
    },
  });

  // Advanced API calls
  const generateAdvancedVideo = trpc.advanced.video.generateAdvancedVideo.useMutation();
  const generateVideoFromImages = trpc.advanced.image.generateVideoFromImages.useMutation();
  const synthesizeSpeech = trpc.advanced.audio.synthesizeSpeech.useMutation();

  // Initialize FFmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          let FFmpeg = (window as any).FFmpeg;
          if (!FFmpeg) {
            await new Promise(resolve => setTimeout(resolve, 500));
            FFmpeg = (window as any).FFmpeg;
          }

          if (!FFmpeg) {
            throw new Error('FFmpeg library not available');
          }

          const { FFmpeg: FFmpegClass } = FFmpeg;
          const ffmpeg = new FFmpegClass();

          if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
          }

          ffmpegRef.current = ffmpeg;
          setFfmpegReady(true);
          break;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            console.error('Failed to initialize FFmpeg:', error);
            setMessage({ type: 'error', text: 'فشل تحميل FFmpeg' });
          }
        }
      }
    };

    initFFmpeg();
  }, []);

  // Basic Text to Video
  const handleTextToVideo = async () => {
    const text = textToVideoRef.current?.value;
    if (!text) {
      setMessage({ type: 'error', text: 'الرجاء إدخال نص' });
      return;
    }

    if (!ffmpegRef.current?.isLoaded()) {
      setMessage({ type: 'error', text: 'النظام غير جاهز' });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('فشل إنشاء canvas');

      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = text.match(/.{1,40}/g) || [];
      const lineHeight = 60;
      const startY = (720 - lines.length * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, 640, startY + i * lineHeight);
      });

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const ffmpeg = ffmpegRef.current;

      ffmpeg.FS('writeFile', 'text.png', await (window as any).FFmpeg.fetchFile(blob));

      await ffmpeg.run(
        '-loop', '1',
        '-i', 'text.png',
        '-t', '5',
        '-pix_fmt', 'yuv420p',
        'out.mp4'
      );

      const data = ffmpeg.FS('readFile', 'out.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      if (videoOutputRef.current) {
        videoOutputRef.current.src = url;
      }

      setMessage({ type: 'success', text: 'تم إنشاء الفيديو بنجاح! 🎬' });
      ffmpeg.FS('unlink', 'text.png');
      ffmpeg.FS('unlink', 'out.mp4');
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Basic Images to Video
  const handleImagesToVideo = async () => {
    const files = imagesToVideoRef.current?.files;
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'الرجاء اختيار صور' });
      return;
    }

    if (!ffmpegRef.current?.isLoaded()) {
      setMessage({ type: 'error', text: 'النظام غير جاهز' });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;

      for (let i = 0; i < files.length; i++) {
        ffmpeg.FS('writeFile', `img${i}.png`, await (window as any).FFmpeg.fetchFile(files[i]));
      }

      let txt = '';
      for (let i = 0; i < files.length; i++) {
        txt += `file 'img${i}.png'\nduration 2\n`;
      }
      txt += `file 'img${files.length - 1}.png'`;

      ffmpeg.FS('writeFile', 'list.txt', txt);

      await ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'list.txt',
        '-pix_fmt', 'yuv420p',
        'slide.mp4'
      );

      const data = ffmpeg.FS('readFile', 'slide.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      if (videoFromImagesRef.current) {
        videoFromImagesRef.current.src = url;
      }

      setMessage({ type: 'success', text: 'تم إنشاء الفيديو من الصور بنجاح! 🎬' });

      for (let i = 0; i < files.length; i++) {
        ffmpeg.FS('unlink', `img${i}.png`);
      }
      ffmpeg.FS('unlink', 'list.txt');
      ffmpeg.FS('unlink', 'slide.mp4');
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Basic Images to GIF
  const handleImagesToGif = async () => {
    const files = imagesToGifRef.current?.files;
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'الرجاء اختيار صور' });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const GIF = (window as any).GIF;
      if (!GIF) throw new Error('مكتبة GIF غير محملة');

      const gif = new (GIF as any)({ workers: 2, quality: 10, workerScript: '/ffmpeg/gif.worker.js' });
      let loaded = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            gif.addFrame(img, { delay: 500 });
            loaded++;
            setProgress((loaded / files.length) * 100);

            if (loaded === files.length) {
              gif.render();
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        if (gifOutputRef.current) {
          gifOutputRef.current.src = url;
        }
        setMessage({ type: 'success', text: 'تم إنشاء GIF بنجاح! 🎬' });
      });
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Advanced Text to Video
  const handleAdvancedTextToVideo = async () => {
    const text = textToVideoRef.current?.value;
    if (!text) {
      setMessage({ type: 'error', text: 'الرجاء إدخال نص' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateAdvancedVideo.mutateAsync({
        text,
        duration: 20,
        includeAudio: true,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `تم إنشاء الفيديو! المدة: ${result.totalDuration || 20} ثانية`,
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Advanced Images to Video
  const handleAdvancedImagesToVideo = async () => {
    const files = imagesToVideoRef.current?.files;
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'الرجاء اختيار صور' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateVideoFromImages.mutateAsync({
        imageCount: files.length,
        secondsPerImage: 2,
        enableKenBurns: true,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `تم إنشاء الفيديو! المدة: ${result.totalDuration || 15} ثانية`,
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced Text to Speech
  const handleAdvancedTextToSpeech = async () => {
    const text = textToSpeechRef.current?.value;
    if (!text) {
      setMessage({ type: 'error', text: 'الرجاء إدخال نص' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await synthesizeSpeech.mutateAsync({
        text,
        language: 'ar-SA' as string,
        rate: 1 as number,
        pitch: 1 as number,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `تم إعداد الصوت! المدة المتوقعة: ${Math.round(result.estimatedDuration || 0)} ثانية`,
        });

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'ar-SA';
        speechSynthesis.speak(speech);
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Text to Speech
  const handleTextToSpeech = async () => {
    const text = textToSpeechRef.current?.value;
    if (!text) {
      setMessage({ type: 'error', text: 'الرجاء إدخال نص' });
      return;
    }

    try {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ar-SA';
      speechSynthesis.speak(speech);
      setMessage({ type: 'success', text: 'جاري تشغيل الصوت... 🔊' });
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              🎬 AI Video Studio Pro
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            أداة احترافية لتحويل النصوص والصور إلى فيديوهات وصور متحركة
          </p>
          <p className="text-sm text-slate-400 mb-6">
            ✨ نسخة محسّنة مع واجهة مستخدم أفضل وتحكم أوضح
          </p>

          {/* Tab Selection */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setActiveTab('basic')}
              variant={activeTab === 'basic' ? 'default' : 'outline'}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'basic'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'border-slate-600 text-slate-300 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30'
              }`}
            >
              <Film className="w-4 h-4 mr-2" />
              الوضع الأساسي
            </Button>
            <Button
              onClick={() => setActiveTab('advanced')}
              variant={activeTab === 'advanced' ? 'default' : 'outline'}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'advanced'
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'border-slate-600 text-slate-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              الوضع المتقدم
            </Button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`flex items-center justify-center gap-3 p-4 rounded-lg mb-6 backdrop-blur-sm ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && (
            <div className="w-full bg-slate-800/50 rounded-full h-3 mb-6 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* System Status */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                ffmpegReady ? 'bg-emerald-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-sm text-slate-400 font-medium">
              {ffmpegReady ? '✅ النظام جاهز' : '⏳ جاري تحميل النظام...'}
            </span>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Text to Video - Basic */}
            <FileProcessingCard
              icon={Film}
              title="تحويل النص إلى فيديو"
              description="أنشئ فيديو احترافي من نص بسيط"
              onProcess={handleTextToVideo}
              isLoading={isLoading}
              isDisabled={!ffmpegReady}
              buttonLabel="إنشاء فيديو"
              buttonIcon={Film}
              variant="primary"
            >
                <textarea
                ref={textToVideoRef}
                placeholder="اكتب النص الذي تريد تحويله إلى فيديو..."
                className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">يمكنك إدخال نص بأي طول</p>
            </FileProcessingCard>

            {/* Images to Video - Basic */}
            <FileProcessingCard
              icon={ImageIcon}
              title="تحويل الصور إلى فيديو"
              description="أنشئ فيديو سلس من مجموعة صور"
              onProcess={handleImagesToVideo}
              isLoading={isLoading}
              isDisabled={!ffmpegReady}
              buttonLabel="إنشاء فيديو"
              buttonIcon={Film}
              variant="primary"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">اختر الصور</label>
                <input
                  ref={imagesToVideoRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg p-4 text-white file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer file:font-semibold hover:border-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-400">اختر صورتين أو أكثر (PNG, JPG, WebP)</p>
              </div>
            </FileProcessingCard>

            {/* Images to GIF */}
            <FileProcessingCard
              icon={Wand2}
              title="تحويل الصور إلى GIF"
              description="أنشئ صورة متحركة من مجموعة صور"
              onProcess={handleImagesToGif}
              isLoading={isLoading}
              buttonLabel="إنشاء GIF"
              buttonIcon={Wand2}
              variant="secondary"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">اختر الصور</label>
                <input
                  ref={imagesToGifRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg p-4 text-white file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer file:font-semibold hover:border-purple-500/50 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-400">اختر صورتين أو أكثر للصورة المتحركة</p>
              </div>
            </FileProcessingCard>

            {/* Text to Speech */}
            <FileProcessingCard
              icon={Volume2}
              title="تحويل النص إلى صوت"
              description="حول نصك إلى صوت احترافي"
              onProcess={handleTextToSpeech}
              isLoading={isLoading}
              buttonLabel="تشغيل الصوت"
              buttonIcon={Volume2}
              variant="success"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">النص المراد تحويله</label>
                <textarea
                  ref={textToSpeechRef}
                  placeholder="اكتب النص الذي تريد تحويله إلى صوت..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-400">يدعم اللغة العربية والإنجليزية</p>
              </div>
            </FileProcessingCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Advanced Text to Video */}
            <FileProcessingCard
              icon={Film}
              title="فيديو متقدم من النص"
              description="أنشئ فيديو احترافي بمؤثرات متقدمة (حتى 20 دقيقة)"
              onProcess={handleAdvancedTextToVideo}
              isLoading={isLoading}
              buttonLabel="إنشاء فيديو متقدم"
              buttonIcon={Zap}
              variant="primary"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">وصف الفيديو</label>
                <textarea
                  ref={textToVideoRef}
                  placeholder="اكتب وصفاً مفصلاً للفيديو الذي تريده..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-400">كلما كان الوصف أكثر تفصيلاً، كان الفيديو أفضل</p>
              </div>
            </FileProcessingCard>

            {/* Advanced Images to Video */}
            <FileProcessingCard
              icon={ImageIcon}
              title="فيديو متقدم من الصور"
              description="أنشئ فيديو احترافي مع حركات واقعية (حتى 15 دقيقة)"
              onProcess={handleAdvancedImagesToVideo}
              isLoading={isLoading}
              buttonLabel="إنشاء فيديو متقدم"
              buttonIcon={Zap}
              variant="primary"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">اختر الصور</label>
                <input
                  ref={imagesToVideoRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg p-4 text-white file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer file:font-semibold hover:border-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-400">اختر صوراً بجودة عالية للحصول على أفضل النتائج</p>
              </div>
            </FileProcessingCard>

            {/* Advanced Text to Speech */}
            <FileProcessingCard
              icon={Volume2}
              title="صوت متقدم من النص"
              description="حول نصك إلى صوت احترافي مع تحكم متقدم"
              onProcess={handleAdvancedTextToSpeech}
              isLoading={isLoading}
              buttonLabel="إنشاء صوت متقدم"
              buttonIcon={Zap}
              variant="success"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">النص المراد تحويله</label>
                <textarea
                  ref={textToSpeechRef}
                  placeholder="اكتب النص الذي تريد تحويله إلى صوت احترافي..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-400">يمكنك التحكم في السرعة والنبرة</p>
              </div>
            </FileProcessingCard>
          </div>
        )}
      </div>

      {/* Output Sections */}
      <div className="max-w-7xl mx-auto space-y-6">
        {videoOutputRef && (
          <OutputSection
            title="فيديو من النص"
            isVisible={!!videoOutputRef.current?.src}
            onDownload={() => {
              const video = videoOutputRef.current;
              if (video && video.src) {
                const link = document.createElement('a');
                link.href = video.src;
                link.download = 'video.mp4';
                link.click();
              }
            }}
            downloadLabel="تنزيل الفيديو"
          >
            <video
              ref={videoOutputRef}
              controls
              className="w-full rounded-lg bg-black"
            />
          </OutputSection>
        )}

        {videoFromImagesRef && (
          <OutputSection
            title="فيديو من الصور"
            isVisible={!!videoFromImagesRef.current?.src}
            onDownload={() => {
              const video = videoFromImagesRef.current;
              if (video && video.src) {
                const link = document.createElement('a');
                link.href = video.src;
                link.download = 'video-from-images.mp4';
                link.click();
              }
            }}
            downloadLabel="تنزيل الفيديو"
          >
            <video
              ref={videoFromImagesRef}
              controls
              className="w-full rounded-lg bg-black"
            />
          </OutputSection>
        )}

        {gifOutputRef && (
          <OutputSection
            title="صورة متحركة GIF"
            isVisible={!!gifOutputRef.current?.src}
            onDownload={() => {
              const gif = gifOutputRef.current;
              if (gif && gif.src) {
                const link = document.createElement('a');
                link.href = gif.src;
                link.download = 'animation.gif';
                link.click();
              }
            }}
            downloadLabel="تنزيل GIF"
          >
            <img
              ref={gifOutputRef}
              className="w-full rounded-lg bg-black"
              alt="GIF Output"
            />
          </OutputSection>
        )}
      </div>
    </div>
  );
}
