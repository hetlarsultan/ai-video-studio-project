import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TemplateLibrary } from '@/components/TemplateLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { AlertCircle, Copy, Download } from 'lucide-react';

interface SelectedTemplate {
  id: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  config?: any;
  isPremium: boolean;
}

export const TemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch template details when selected
  const templateQuery = trpc.templates.getTemplate.useQuery(
    { id: selectedTemplate?.id || 0 },
    { enabled: selectedTemplate !== null && isDialogOpen }
  );

  const handleTemplateSelect = (template: SelectedTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate?.config) {
      // Store template config in localStorage for use in editor
      localStorage.setItem('selectedTemplateConfig', JSON.stringify(selectedTemplate.config));
      // Navigate to editor or trigger editor with template
      window.location.href = '/?template=' + selectedTemplate.id;
    }
  };

  const handleCopyConfig = () => {
    if (selectedTemplate?.config) {
      navigator.clipboard.writeText(JSON.stringify(selectedTemplate.config, null, 2));
      alert('تم نسخ إعدادات القالب بنجاح!');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <TemplateLibrary onTemplateSelect={handleTemplateSelect} />
      </div>

      {/* Template Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {templateQuery.isLoading ? (
            <div className="space-y-4 py-4">
              <div className="h-64 bg-slate-700 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ) : templateQuery.data?.template ? (
            <div className="space-y-6 py-4">
              {/* Thumbnail */}
              {templateQuery.data.template.thumbnailUrl && (
                <div className="relative h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden">
                  <img
                    src={templateQuery.data.template.thumbnailUrl}
                    alt={templateQuery.data.template.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{templateQuery.data.template.category}</Badge>
                  {templateQuery.data.template.isPremium && (
                    <Badge className="bg-yellow-500 text-black">متميز</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">عدد الاستخدامات</p>
                    <p className="text-lg font-semibold">{templateQuery.data.template.usageCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">تاريخ الإنشاء</p>
                    <p className="text-lg font-semibold">
                      {new Date(templateQuery.data.template.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                {/* Config Preview */}
                {templateQuery.data.template.config && Object.keys(templateQuery.data.template.config).length > 0 && (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">إعدادات القالب</p>
                    <pre className="text-xs text-slate-300 overflow-auto max-h-40">
                      {JSON.stringify(templateQuery.data.template.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUseTemplate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  استخدام هذا القالب
                </Button>
                <Button
                  onClick={handleCopyConfig}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  نسخ الإعدادات
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-4 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p>حدث خطأ في تحميل تفاصيل القالب</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
