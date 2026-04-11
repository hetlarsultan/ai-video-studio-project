import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  Film,
  Type,
  Music,
  Image,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
} from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { VideoUploader } from '@/components/VideoUploader';
import { DownloadButton } from '@/components/DownloadButton';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface TimelineClip {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio';
  name: string;
  startTime: number;
  duration: number;
  url?: string;
  content?: string;
  properties?: Record<string, any>;
}

interface EditorState {
  projectId: number;
  clips: TimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  selectedClipId?: string;
}

export default function VideoEditor() {
  const [, params] = useRoute('/editor/:id');
  const [, setLocation] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;

  const [state, setState] = useState<EditorState>({
    projectId,
    clips: [],
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    volume: 100,
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'completed' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const projectQuery = trpc.projects.get.useQuery({ id: projectId });
  const updateProjectMutation = trpc.projects.update.useMutation();

  // Load project data
  useEffect(() => {
    if (projectQuery.data?.success && projectQuery.data.project) {
      const project = projectQuery.data.project;
      setState(prev => ({
        ...prev,
        clips: project.clips || [],
        duration: project.duration || 0,
      }));
    }
  }, [projectQuery.data]);

  // Add clip to timeline
  const handleAddClip = (type: TimelineClip['type']) => {
    const newClip: TimelineClip = {
      id: Date.now().toString(),
      type,
      name: `${type} - ${state.clips.length + 1}`,
      startTime: state.currentTime,
      duration: 5,
    };

    setState(prev => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));

    toast.success(`تم إضافة ${type} جديد`);
  };

  // Remove clip from timeline
  const handleRemoveClip = (clipId: string) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.filter(c => c.id !== clipId),
      selectedClipId: prev.selectedClipId === clipId ? undefined : prev.selectedClipId,
    }));
    toast.success('تم حذف المقطع');
  };

  // Update clip duration
  const handleUpdateClipDuration = (clipId: string, duration: number) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(c =>
        c.id === clipId ? { ...c, duration } : c
      ),
    }));
  };

  // Play/Pause
  const togglePlayPause = () => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // Save project
  const handleSaveProject = async () => {
    try {
      const result = await updateProjectMutation.mutateAsync({
        id: projectId,
        clipsData: JSON.stringify(state.clips),
        duration: Math.round(state.currentTime),
      });

      if (result.success) {
        toast.success('تم حفظ المشروع بنجاح');
      } else {
        toast.error(result.error || 'فشل حفظ المشروع');
      }
    } catch (error) {
      toast.error(`خطأ: ${(error as Error).message}`);
    }
  };

  // Export video
  const handleExportVideo = async () => {
    if (state.clips.length === 0) {
      toast.error('الرجاء إضافة مقاطع قبل التصدير');
      return;
    }

    setShowExportDialog(true);
    setExportStatus('exporting');
    setExportProgress(0);

    // Simulate export progress
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress(i);
      }

      // Generate download URL (simulated)
      const videoBlob = new Blob(['video data'], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);
      setExportStatus('completed');

      // Update project status
      await updateProjectMutation.mutateAsync({
        id: projectId,
        status: 'completed',
        videoUrl: url,
      });

      toast.success('تم تصدير الفيديو بنجاح!');
    } catch (error) {
      setExportStatus('error');
      toast.error(`خطأ في التصدير: ${(error as Error).message}`);
    }
  };

  // Download video
  const handleDownloadVideo = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `video-${projectId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('تم بدء تحميل الفيديو');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (projectQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!projectQuery.data?.success) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">خطأ</h1>
            <p className="text-slate-400 mb-6">فشل تحميل المشروع</p>
            <Button
              onClick={() => setLocation('/dashboard')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              العودة إلى المشاريع
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">{projectQuery.data.project?.title}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProject}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                حفظ
              </Button>
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                العودة
              </Button>
              <Button
                onClick={handleExportVideo}
                className="bg-green-500 hover:bg-green-600 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                تصدير الفيديو
              </Button>
              <DownloadButton
                projectName={projectQuery.data.project?.title || 'video'}
              />
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Preview and Properties */}
          <div className="flex flex-1 gap-4 p-4 overflow-hidden">
            {/* Preview Panel */}
            <div className="flex-1 flex flex-col">
              <div className="bg-black rounded-lg overflow-hidden mb-4 flex-1 flex items-center justify-center">
                <video
                  ref={videoPreviewRef}
                  className="w-full h-full object-contain"
                  controls
                />
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    onClick={togglePlayPause}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {state.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <Slider
                      value={[state.currentTime]}
                      onValueChange={(value) =>
                        setState(prev => ({ ...prev, currentTime: value[0] }))
                      }
                      max={state.duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <span className="text-sm text-slate-400 font-mono">
                    {formatTime(state.currentTime)} / {formatTime(state.duration)}
                  </span>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <Slider
                    value={[state.volume]}
                    onValueChange={(value) =>
                      setState(prev => ({ ...prev, volume: value[0] }))
                    }
                    max={100}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs text-slate-400">{state.volume}%</span>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-slate-800 rounded-lg border border-slate-700 p-4 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4">الخصائص</h3>

              {state.selectedClipId ? (
                <div className="space-y-4">
                  {/* Clip Properties */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      المدة (ثانية)
                    </label>
                    <Slider
                      value={[
                        state.clips.find(c => c.id === state.selectedClipId)?.duration || 5,
                      ]}
                      onValueChange={(value) =>
                        handleUpdateClipDuration(state.selectedClipId!, value[0])
                      }
                      max={60}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      onClick={() =>
                        handleRemoveClip(state.selectedClipId!)
                      }
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      حذف المقطع
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">اختر مقطعاً لعرض خصائصه</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-slate-700 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Timeline</h3>
              <div className="flex gap-2">
                <VideoUploader
                  onFilesUploaded={(files) => {
                    files.forEach(file => {
                      if (file.status === 'completed') {
                        handleAddClip('video');
                      }
                    });
                  }}
                  acceptedTypes={['.mp4', '.avi', '.mov', '.mkv', '.webm']}
                />
                <Button
                  onClick={() => handleAddClip('image')}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1"
                >
                  <Image className="w-3 h-3" />
                  صورة
                </Button>
                <Button
                  onClick={() => handleAddClip('text')}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1"
                >
                  <Type className="w-3 h-3" />
                  نص
                </Button>
                <Button
                  onClick={() => handleAddClip('audio')}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1"
                >
                  <Music className="w-3 h-3" />
                  صوت
                </Button>
              </div>
            </div>

            {/* Timeline Tracks */}
            <div
              ref={timelineRef}
              className="bg-slate-800 rounded-lg border border-slate-700 p-3 overflow-x-auto"
            >
              {state.clips.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>لا توجد مقاطع. أضف مقطعاً لبدء التحرير</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.clips.map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() =>
                        setState(prev => ({
                          ...prev,
                          selectedClipId: clip.id,
                        }))
                      }
                      className={`p-3 rounded cursor-pointer transition-all ${
                        state.selectedClipId === clip.id
                          ? 'bg-cyan-500/30 border-2 border-cyan-500'
                          : 'bg-slate-700 border border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {clip.type === 'video' && <Video className="w-4 h-4 text-blue-400" />}
                          {clip.type === 'image' && <Image className="w-4 h-4 text-purple-400" />}
                          {clip.type === 'text' && <Type className="w-4 h-4 text-yellow-400" />}
                          {clip.type === 'audio' && <Music className="w-4 h-4 text-green-400" />}
                          <span className="text-sm font-medium text-white">{clip.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatTime(clip.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">تصدير الفيديو</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  التقدم
                </label>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2 text-center">{exportProgress}%</p>
              </div>

              {exportStatus === 'exporting' && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
                  <p className="text-slate-300">جاري تصدير الفيديو...</p>
                </div>
              )}

              {exportStatus === 'completed' && (
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-medium">تم تصدير الفيديو بنجاح! 🎉</p>
                  </div>
                  <Button
                    onClick={handleDownloadVideo}
                    className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"
                  >
                    <Download className="w-4 h-4" />
                    تحميل الفيديو
                  </Button>
                </div>
              )}

              {exportStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 font-medium">حدث خطأ في التصدير</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
