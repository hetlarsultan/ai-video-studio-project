import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface VideoUploaderProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
}

export function VideoUploader({
  onFilesUploaded,
  acceptedTypes = ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  maxFileSize = 500, // 500 MB
}: VideoUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

      // Validate file type
      if (!acceptedTypes.includes(fileExt)) {
        newFiles.push({
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'error',
          error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedTypes.join(', ')}`,
        });
        continue;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        newFiles.push({
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'error',
          error: `حجم الملف يتجاوز ${maxFileSize}MB`,
        });
        continue;
      }

      // Add file for upload
      newFiles.push({
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
      });

      // Simulate upload progress
      simulateUpload(Date.now().toString() + i);
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsDialogOpen(true);

    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
    }
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress: 100, status: 'completed' }
              : f
          )
        );
      } else {
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          )
        );
      }
    }, 300);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClearAll = () => {
    setFiles([]);
    setIsDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <>
      {/* Upload Button */}
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
      >
        <Upload className="w-4 h-4" />
        تحميل الفيديو
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">تحميل الملفات</DialogTitle>
            <DialogDescription className="text-slate-400">
              {files.length} ملف • {completedCount} مكتمل • {errorCount} خطأ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map(file => (
              <Card
                key={file.id}
                className="bg-slate-700 border-slate-600 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <File className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                {file.status === 'error' ? (
                  <p className="text-xs text-red-400">{file.error}</p>
                ) : (
                  <div className="space-y-1">
                    <Progress
                      value={file.progress}
                      className="h-1.5"
                    />
                    <p className="text-xs text-slate-400 text-right">
                      {Math.round(file.progress)}%
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              إغلاق
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
            >
              <Upload className="w-4 h-4" />
              إضافة المزيد
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
