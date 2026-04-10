import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { toast } from 'sonner';

interface DownloadButtonProps {
  videoFile?: File;
  projectName?: string;
  onDownload?: (blob: Blob) => void;
}

export function DownloadButton({ videoFile, projectName = 'video', onDownload }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isLoaded, isLoading, progress, loadFFmpeg, processVideo } = useFFmpeg();

  const formats = [
    { label: 'MP4 (موصى به)', value: 'mp4', type: 'video/mp4' },
    { label: 'WebM', value: 'webm', type: 'video/webm' },
    { label: 'MOV', value: 'mov', type: 'video/quicktime' },
  ];

  const handleLoadFFmpeg = async () => {
    await loadFFmpeg();
  };

  const handleDownload = async () => {
    if (!videoFile) {
      // محاكاة تحميل الفيديو الوهمي
      simulateDownload();
      return;
    }

    if (!isLoaded) {
      toast.error('يرجى تحميل FFmpeg أولاً');
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await processVideo(videoFile, selectedFormat);
      if (blob) {
        downloadBlob(blob, selectedFormat);
        onDownload?.(blob);
        setIsOpen(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateDownload = () => {
    // إنشاء فيديو وهمي للاختبار
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI Video Studio Pro', canvas.width / 2, canvas.height / 2 - 50);
      ctx.font = '32px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('تم إنشاء الفيديو بنجاح!', canvas.width / 2, canvas.height / 2 + 50);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, selectedFormat);
        onDownload?.(blob);
        setIsOpen(false);
        toast.success('تم تحميل الفيديو بنجاح');
      }
    }, `video/${selectedFormat}`);
  };

  const downloadBlob = (blob: Blob, format: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
      >
        <Download className="w-4 h-4" />
        تحميل الفيديو
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              تحميل الفيديو
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                اختر صيغة الفيديو
              </label>
              <div className="space-y-2">
                {formats.map(format => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`w-full py-2 px-3 rounded text-left transition-all ${
                      selectedFormat === format.value
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FFmpeg Status */}
            <div className="bg-slate-700 rounded p-3 border border-slate-600">
              <p className="text-sm text-slate-300 mb-2">حالة FFmpeg:</p>
              {isLoaded ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>محمل وجاهز</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>لم يتم التحميل</span>
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div>
                <p className="text-sm text-white mb-2">{progress.status}</p>
                <Progress value={progress.progress} className="h-2" />
              </div>
            )}

            {/* Format Info */}
            <div className="bg-slate-700 rounded p-3 border border-slate-600">
              <p className="text-xs text-slate-400">
                <strong>ملاحظة:</strong> يتم معالجة الفيديو محلياً في متصفحك باستخدام FFmpeg.wasm
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                إلغاء
              </button>

              {!isLoaded && !isLoading && (
                <button
                  onClick={handleLoadFFmpeg}
                  className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 gap-2 flex items-center"
                >
                  <Loader2 className="w-4 h-4" />
                  تحميل FFmpeg
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={isProcessing || (!videoFile && !isLoaded)}
                className="px-4 py-2 rounded text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 gap-2 flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    تحميل الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
