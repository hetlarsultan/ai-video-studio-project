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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

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

      {/* معلومات الوقت */}
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(endTime - startTime)}</span>
      </div>

      {/* شريط التقدم */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
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
