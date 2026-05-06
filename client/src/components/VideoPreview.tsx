import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, X, Check } from 'lucide-react';

interface VideoPreviewProps {
  videoUrl: string;
  startTime: number; // بالثواني
  endTime: number; // بالثواني
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * مكون معاينة الفيديو المقصوص
 * يسمح للمستخدم برؤية الفيديو المقصوص قبل التأكيد النهائي
 */
export default function VideoPreview({
  videoUrl,
  startTime,
  endTime,
  onConfirm,
  onCancel,
  isLoading = false,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // تحديث الوقت الحالي
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // إيقاف التشغيل عند نهاية الفيديو المقصوص
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
    };

    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [startTime, endTime]);

  // تشغيل/إيقاف الفيديو
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // إعادة تشغيل من البداية
  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
    videoRef.current.play();
    setIsPlaying(true);
  };

  // التحكم بالصوت
  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // التحكم بمستوى الصوت
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // تنسيق الوقت (mm:ss)
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // معالجة تحريك الفأرة على شريط التقدم
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = startTime + (endTime - startTime) * percentage;

    setHoverTime(time);
    setHoverPosition(x);
  };

  // إخفاء معاينة الوقت عند مغادرة شريط التقدم
  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  // تغيير وقت الفيديو عند النقر على شريط التقدم
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = startTime + (endTime - startTime) * percentage;

    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // حساب نسبة التقدم
  const progress = ((currentTime - startTime) / (endTime - startTime)) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-card border border-border shadow-lg">
      {/* رأس المعاينة */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">معاينة الفيديو المقصوص</h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="إغلاق المعاينة"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* الفيديو */}
      <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto max-h-96 object-contain"
          crossOrigin="anonymous"
        />
        
        {/* زر التشغيل المركزي */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
          >
            <Play className="w-16 h-16 text-white fill-white" />
          </button>
        )}
      </div>

      {/* معلومات الوقت محسّنة */}
      <div className="flex justify-between items-center text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-400">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(endTime - startTime)}</span>
        </div>
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
          {Math.round(progress)}%
        </span>
      </div>

      {/* شريط التقدم محسّن مع معاينة الوقت */}
      <div className="relative mb-6">
        <div
          ref={progressBarRef}
          onMouseMove={handleProgressHover}
          onMouseLeave={handleProgressLeave}
          onClick={handleProgressClick}
          className="relative w-full h-3 bg-muted rounded-full overflow-hidden cursor-pointer group hover:h-4 transition-all"
        >
          {/* شريط التقدم الرئيسي */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
          
          {/* نقطة التشغيل الحالية */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              left: `${Math.max(0, Math.min(100, progress))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* معاينة الوقت عند المرور */}
        {hoverTime !== null && (
          <div
            className="absolute -top-14 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg border border-cyan-500/50 pointer-events-none whitespace-nowrap z-10"
            style={{
              left: `${hoverPosition}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-cyan-300">{formatTime(hoverTime)}</span>
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* التحكم بالصوت والتشغيل */}
      <div className="flex items-center gap-4 mb-6">
        {/* زر التشغيل/الإيقاف */}
        <Button
          onClick={handlePlayPause}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              إيقاف
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              تشغيل
            </>
          )}
        </Button>

        {/* زر إعادة التشغيل */}
        <Button
          onClick={handleReplay}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          إعادة
        </Button>

        {/* التحكم بالصوت */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleMuteToggle}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-foreground" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            aria-label="مستوى الصوت"
          />
        </div>
      </div>

      {/* معلومات القص */}
      <div className="bg-muted/50 rounded-lg p-3 mb-6 text-sm">
        <p className="text-foreground">
          <strong>نطاق القص:</strong> {formatTime(startTime)} - {formatTime(endTime)}
        </p>
        <p className="text-muted-foreground">
          المدة: {formatTime(endTime - startTime)}
        </p>
      </div>

      {/* أزرار التأكيد والإلغاء */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              تأكيد القص
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
