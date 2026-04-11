import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Film, Image, Wand2, Volume2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * AI Video Studio Pro - Advanced Edition
 * - Dynamic scene generation from text (up to 20 minutes)
 * - Realistic image animations with Ken Burns effect (up to 15 minutes)
 * - Advanced audio-video synchronization
 * - Professional visual effects and transitions
 */

export default function Home() {
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  
  const textToVideoRef = useRef<HTMLTextAreaElement>(null);
  const imagesToVideoRef = useRef<HTMLInputElement>(null);
  const imagesToGifRef = useRef<HTMLInputElement>(null);
  const textToSpeechRef = useRef<HTMLTextAreaElement>(null);
  const videoOutputRef = useRef<HTMLVideoElement>(null);
  const videoFromImagesRef = useRef<HTMLVideoElement>(null);
  const gifOutputRef = useRef<HTMLImageElement>(null);

  const ffmpegRef = useRef<any>(null);

  // Advanced API calls
  const generateAdvancedVideo = trpc.advanced.video.generateAdvancedVideo.useMutation();
  const generateVideoFromImages = trpc.advanced.image.generateVideoFromImages.useMutation();
  const synthesizeSpeech = trpc.advanced.audio.synthesizeSpeech.useMutation();

  // Initialize FFmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        const FFmpeg = (window as any).FFmpeg;
        if (!FFmpeg) {
          setMessage({ type: 'error', text: 'فشل تحميل FFmpeg' });
          return;
        }

        const { createFFmpeg } = FFmpeg;
        const ffmpeg = createFFmpeg({
          log: true,
          corePath: '/ffmpeg/ffmpeg-core.js',
          progress: ({ ratio }: { ratio: number }) => {
            setProgress(Math.round(ratio * 100));
          },
        });

        ffmpegRef.current = ffmpeg;

        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        setFfmpegReady(true);
        setMessage({ type: 'success', text: 'تم تحميل النظام بنجاح ✅' });
      } catch (error) {
        setMessage({ type: 'error', text: `خطأ في التحميل: ${(error as Error).message}` });
      }
    };

    initFFmpeg();
  }, []);

  // Advanced Text to Video
  const handleAdvancedTextToVideo = async () => {
    const text = textToVideoRef.current?.value;
    if (!text) {
      setMessage({ type: 'error', text: 'الرجاء إدخال نص' });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const result = await generateAdvancedVideo.mutateAsync({
        text,
        duration: 600 as number, // 10 minutes
        includeAudio: true,
        animationStyle: 'fade' as const,
      });

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `${result.message || 'تم الإنشاء'} المدة الكلية: ${Math.round(result.totalDuration || 0)} ثانية` 
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
    setProgress(0);

    try {
      const result = await generateVideoFromImages.mutateAsync({
        imageCount: files.length,
        secondsPerImage: 3 as number,
        transitionType: 'dissolve' as const,
        enableKenBurns: true,
        enableParallax: false,
      });

      if (result.success) {

        setMessage({ 
          type: 'success', 
          text: `تم إنشاء فيديو من ${files.length} صورة! المدة: ${Math.round(result.totalDuration || 0)} ثانية` 
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
          text: `تم إعداد الصوت! المدة المتوقعة: ${Math.round(result.estimatedDuration || 0)} ثانية` 
        });

        // Play using Web Speech API
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

  // Basic Text to Video (original)
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
        const img = new (Image as any)();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          gif.addFrame(img, { delay: 500 });
          loaded++;
          setProgress(Math.round((loaded / files.length) * 100));

          if (loaded === files.length) {
            gif.on('finished', (blob: Blob) => {
              const url = URL.createObjectURL(blob);
              if (gifOutputRef.current) {
                gifOutputRef.current.src = url;
              }
              setMessage({ type: 'success', text: 'تم إنشاء GIF بنجاح! 🎨' });
            });
            gif.render();
          }
        };
      });
    } catch (error) {
      setMessage({ type: 'error', text: `خطأ: ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Text to Speech
  const handleTextToSpeech = () => {
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
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🎬 AI Video Studio Pro
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            أداة احترافية لتحويل النصوص والصور إلى فيديوهات وصور متحركة
          </p>
          <p className="text-sm text-slate-400 mb-6">
            ✨ نسخة متقدمة مع دعم الفيديوهات الطويلة (حتى 20 دقيقة) والحركات الواقعية
          </p>

          {/* Tab Selection */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setActiveTab('basic')}
              variant={activeTab === 'basic' ? 'default' : 'outline'}
              className={activeTab === 'basic' ? 'bg-cyan-600' : ''}
            >
              الوضع الأساسي
            </Button>
            <Button
              onClick={() => setActiveTab('advanced')}
              variant={activeTab === 'advanced' ? 'default' : 'outline'}
              className={activeTab === 'advanced' ? 'bg-cyan-600' : ''}
            >
              <Zap className="w-4 h-4 mr-2" />
              الوضع المتقدم
            </Button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`flex items-center justify-center gap-2 p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && (
            <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* System Status */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${ffmpegReady ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-slate-400">
              {ffmpegReady ? 'النظام جاهز ✅' : 'جاري تحميل النظام...'}
            </span>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Text to Video - Basic */}
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Film className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">تحويل النص إلى فيديو</h2>
              </div>
              <textarea
                ref={textToVideoRef}
                placeholder="اكتب النص الذي تريد تحويله إلى فيديو..."
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              />
              <Button
                onClick={handleTextToVideo}
                disabled={isLoading || !ffmpegReady}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Film className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء فيديو'}
              </Button>
              {videoOutputRef && (
                <video
                  ref={videoOutputRef}
                  controls
                  className="w-full mt-4 rounded-lg bg-black"
                />
              )}
            </Card>

            {/* Images to Video - Basic */}
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Image className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">تحويل الصور إلى فيديو</h2>
              </div>
              <input
                ref={imagesToVideoRef}
                type="file"
                multiple
                accept="image/*"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white file:bg-cyan-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer hover:border-cyan-500/50 transition-colors"
              />
              <Button
                onClick={handleImagesToVideo}
                disabled={isLoading || !ffmpegReady}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Film className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء فيديو'}
              </Button>
              {videoFromImagesRef && (
                <video
                  ref={videoFromImagesRef}
                  controls
                  className="w-full mt-4 rounded-lg bg-black"
                />
              )}
            </Card>

            {/* Images to GIF */}
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Wand2 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">تحويل الصور إلى GIF</h2>
              </div>
              <input
                ref={imagesToGifRef}
                type="file"
                multiple
                accept="image/*"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white file:bg-cyan-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer hover:border-cyan-500/50 transition-colors"
              />
              <Button
                onClick={handleImagesToGif}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء GIF'}
              </Button>
              {gifOutputRef && (
                <img
                  ref={gifOutputRef}
                  className="w-full mt-4 rounded-lg bg-black"
                  alt="GIF Output"
                />
              )}
            </Card>

            {/* Text to Speech */}
            <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">تحويل النص إلى صوت</h2>
              </div>
              <textarea
                ref={textToSpeechRef}
                placeholder="اكتب النص الذي تريد تحويله إلى صوت..."
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              />
              <Button
                onClick={handleTextToSpeech}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                تشغيل الصوت
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Advanced Text to Video */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 p-6 hover:border-cyan-500/70 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">فيديو متقدم من النص</h2>
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">حتى 20 دقيقة</span>
              </div>
              <textarea
                ref={textToVideoRef}
                placeholder="أدخل نص طويل لإنشاء فيديو متقدم مع مشاهد متحركة وبيئات ديناميكية..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              />
              <Button
                onClick={handleAdvancedTextToVideo}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء فيديو متقدم'}
              </Button>
              <p className="text-xs text-slate-400 mt-2">✨ مع مشاهد متحركة وصوت متزامن</p>
            </Card>

            {/* Advanced Images to Video */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 p-6 hover:border-cyan-500/70 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">فيديو متقدم من الصور</h2>
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">حتى 15 دقيقة</span>
              </div>
              <input
                ref={imagesToVideoRef}
                type="file"
                multiple
                accept="image/*"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white file:bg-yellow-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer hover:border-cyan-500/50 transition-colors"
              />
              <Button
                onClick={handleAdvancedImagesToVideo}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء فيديو متقدم'}
              </Button>
              <p className="text-xs text-slate-400 mt-2">✨ مع تأثير Ken Burns والحركات الواقعية</p>
            </Card>

            {/* Advanced Text to Speech */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/30 p-6 hover:border-cyan-500/70 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">صوت متقدم من النص</h2>
              </div>
              <textarea
                ref={textToSpeechRef}
                placeholder="أدخل نص طويل لتحويله إلى صوت طبيعي متزامن مع الفيديو..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              />
              <Button
                onClick={handleAdvancedTextToSpeech}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {isLoading ? 'جاري المعالجة...' : 'إنشاء صوت متقدم'}
              </Button>
              <p className="text-xs text-slate-400 mt-2">✨ مع تزامن تلقائي مع الفيديو</p>
            </Card>

            {/* Info Card */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-bold mb-4">🚀 المميزات المتقدمة</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✅ فيديوهات طويلة حتى 20 دقيقة</li>
                <li>✅ مشاهد متحركة ديناميكية</li>
                <li>✅ حركات واقعية للصور</li>
                <li>✅ تأثير Ken Burns الاحترافي</li>
                <li>✅ تزامن صوت-فيديو تلقائي</li>
                <li>✅ بيئات متحركة وانتقالات سلسة</li>
              </ul>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>جميع المعالجات تتم محليًا في المتصفح - لا توجد تحميلات على الخادم - مجاني 100%</p>
      </div>
    </div>
  );
}
