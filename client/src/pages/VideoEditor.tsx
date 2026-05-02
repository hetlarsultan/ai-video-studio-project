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
import { DownloadButton } from '@/components/DownloadButton';
import VisualEffects from '@/components/VisualEffects';
import TrimCut from '@/components/TrimCut';
import { useAutoSave } from '@/hooks/useAutoSave';
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

  // Auto-save handler
  const handleAutoSave = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        title: projectQuery.data?.project?.title || '',
        description: projectQuery.data?.project?.description || '',
        duration: state.duration,
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  // استخدام useAutoSave
  useAutoSave(state, {
    interval: 30000,
    onSave: handleAutoSave,
    enabled: true,
  });

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

  // Update clip duration
  const handleUpdateClipDuration = (clipId: string, duration: number) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip =>
        clip.id === clipId ? { ...clip, duration } : clip
      ),
    }));
  };

  // Remove clip
  const handleRemoveClip = (clipId: string) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.filter(clip => clip.id !== clipId),
    }));
    toast.success('تم حذف المقطع');
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // Save project
  const handleSaveProject = async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        title: projectQuery.data?.project?.title || '',
        description: projectQuery.data?.project?.description || '',
        duration: state.duration,
      });
      toast.success('تم حفظ المشروع');
    } catch (error) {
      toast.error('فشل حفظ المشروع');
    }
  };

  // Export video
  const handleExportVideo = async () => {
    setShowExportDialog(true);
    setExportStatus('exporting');
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate download URL
      const url = URL.createObjectURL(new Blob(['video data'], { type: 'video/mp4' }));
      setDownloadUrl(url);
      setExportStatus('completed');
      toast.success('تم تصدير الفيديو بنجاح');
    } catch (error) {
      setExportStatus('error');
      toast.error('فشل تصدير الفيديو');
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
                    {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatTime(state.currentTime)}</span>
                    <div className="flex-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-xs text-slate-400">{formatTime(state.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[state.volume]}
                      onValueChange={(value) =>
                        setState(prev => ({ ...prev, volume: value[0] }))
                      }
                      max={100}
                      className="w-24"
                    />
                  </div>
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

                  {/* Visual Effects */}
                  <div className="pt-4 border-t border-slate-700">
                    <VisualEffects />
                  </div>

                  {/* Trim & Cut */}
                  <div className="pt-4 border-t border-slate-700">
                    <TrimCut duration={state.clips.find(c => c.id === state.selectedClipId)?.duration || 100} />
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
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 mb-4">اختر مقطعاً لتحرير خصائصه</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddClip('video')}
                      className="w-full gap-2 bg-slate-700 hover:bg-slate-600"
                    >
                      <Video className="w-4 h-4" />
                      إضافة فيديو
                    </Button>
                    <Button
                      onClick={() => handleAddClip('image')}
                      className="w-full gap-2 bg-slate-700 hover:bg-slate-600"
                    >
                      <Image className="w-4 h-4" />
                      إضافة صورة
                    </Button>
                    <Button
                      onClick={() => handleAddClip('text')}
                      className="w-full gap-2 bg-slate-700 hover:bg-slate-600"
                    >
                      <Type className="w-4 h-4" />
                      إضافة نص
                    </Button>
                    <Button
                      onClick={() => handleAddClip('audio')}
                      className="w-full gap-2 bg-slate-700 hover:bg-slate-600"
                    >
                      <Music className="w-4 h-4" />
                      إضافة صوت
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-slate-700 bg-slate-900/50 p-4">
            <div
              ref={timelineRef}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4 min-h-[120px] overflow-x-auto"
            >
              <h3 className="text-sm font-bold text-white mb-3">Timeline</h3>
              <div className="space-y-2">
                {state.clips.length === 0 ? (
                  <p className="text-xs text-slate-500">لا توجد مقاطع. أضف مقطعاً من لوحة الخصائص</p>
                ) : (
                  state.clips.map(clip => (
                    <div
                      key={clip.id}
                      onClick={() => setState(prev => ({ ...prev, selectedClipId: clip.id }))}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        state.selectedClipId === clip.id
                          ? 'bg-cyan-500/30 border border-cyan-500'
                          : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{clip.name}</span>
                        <span className="text-xs text-slate-400">{formatTime(clip.duration)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">تصدير الفيديو</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {exportStatus === 'exporting' && (
                <>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-300">جاري التصدير... {exportProgress}%</p>
                </>
              )}
              {exportStatus === 'completed' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم التصدير بنجاح</span>
                </div>
              )}
              {exportStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>فشل التصدير</span>
                </div>
              )}
              {downloadUrl && (
                <Button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = 'video.mp4';
                    a.click();
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  تحميل الفيديو
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
