import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Film, Plus, Trash2, Edit2, Play, Clock, Calendar, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Project {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'processing' | 'completed';
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // tRPC queries and mutations
  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    enabled: !authLoading && !!user,
  });

  const createProjectMutation = trpc.projects.create.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();

  // Load projects
  useEffect(() => {
    if (projectsQuery.data?.success && projectsQuery.data.projects) {
      setProjects(
        projectsQuery.data.projects.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })) as Project[]
      );
    }
  }, [projectsQuery.data]);

  // Create new project
  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      toast.error('الرجاء إدخال اسم المشروع');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createProjectMutation.mutateAsync({
        title: newProjectTitle,
        description: newProjectDescription,
      });

      if (result.success) {
        toast.success('تم إنشاء المشروع بنجاح');
        setNewProjectTitle('');
        setNewProjectDescription('');
        setIsNewProjectDialogOpen(false);

        // Refresh projects list
        await projectsQuery.refetch();

        // Navigate to editor after a short delay
        setTimeout(() => {
          const newProject = projects[projects.length - 1];
          if (newProject) {
            setLocation(`/editor/${newProject.id}`);
          }
        }, 500);
      } else {
        toast.error(result.error || 'فشل إنشاء المشروع');
      }
    } catch (error) {
      toast.error(`خطأ: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }

    try {
      const result = await deleteProjectMutation.mutateAsync({ id });

      if (result.success) {
        toast.success('تم حذف المشروع بنجاح');
        setProjects(projects.filter(p => p.id !== id));
      } else {
        toast.error(result.error || 'فشل حذف المشروع');
      }
    } catch (error) {
      toast.error(`خطأ: ${(error as Error).message}`);
    }
  };

  // Open project in editor
  const handleOpenProject = (id: number) => {
    setLocation(`/editor/${id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'processing':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (authLoading || projectsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Film className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">مشاريعي</h1>
                  <p className="text-slate-400">إدارة وتحرير مشاريع الفيديو الخاصة بك</p>
                </div>
              </div>
              <Button
                onClick={() => setIsNewProjectDialogOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                مشروع جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="container mx-auto px-4 py-12">
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">لا توجد مشاريع</h2>
              <p className="text-slate-400 mb-6">ابدأ بإنشاء مشروع جديد لتحرير الفيديو</p>
              <Button
                onClick={() => setIsNewProjectDialogOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                إنشاء مشروع جديد
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition-all duration-300 overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Film className="w-12 h-12 text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(project.duration / 60)} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{project.createdAt.toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenProject(project.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        تحرير
                      </Button>
                      <Button
                        onClick={() => handleDeleteProject(project.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* New Project Dialog */}
        <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">مشروع جديد</DialogTitle>
              <DialogDescription className="text-slate-400">
                أنشئ مشروع فيديو جديد لبدء التحرير
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  اسم المشروع
                </label>
                <Input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="مثال: فيديو ترويجي للمنتج"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  الوصف (اختياري)
                </label>
                <Textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="أضف وصفاً لمشروعك..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  onClick={() => setIsNewProjectDialogOpen(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={isLoading || !newProjectTitle.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء المشروع'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
