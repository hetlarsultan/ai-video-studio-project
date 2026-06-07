import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Calendar } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';

export interface ProcessedFile {
  id: string;
  name: string;
  type: 'video' | 'gif' | 'audio' | 'image';
  url: string;
  timestamp: number;
  size?: number;
}

interface FileHistoryProps {
  onDownload?: (file: ProcessedFile) => void;
  onDelete?: (fileId: string) => void;
}

export const FileHistory: React.FC<FileHistoryProps> = ({ onDownload, onDelete }) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // تحميل السجل من localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('processedFiles');
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error('خطأ في تحميل السجل:', error);
      }
    }
  }, []);

  // حفظ السجل في localStorage
  const saveToLocalStorage = (updatedFiles: ProcessedFile[]) => {
    localStorage.setItem('processedFiles', JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };



  // حذف ملف من السجل
  const handleDelete = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    saveToLocalStorage(updatedFiles);
    onDelete?.(fileId);
  };

  // تنزيل ملف
  const handleDownload = (file: ProcessedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.(file);
  };

  // تنسيق التاريخ والوقت
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // تنسيق حجم الملف
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'غير معروف';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // أيقونة نوع الملف
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'gif':
        return '🎞️';
      case 'audio':
        return '🎵';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-slate-700/50 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors mb-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-200">
              سجل الملفات المعالجة ({files.length})
            </h2>
          </div>
          <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>{formatDate(file.timestamp)}</span>
                      {file.size && <span>{formatSize(file.size)}</span>}
                      <span className="px-2 py-1 rounded bg-slate-700/50 text-cyan-400">
                        {file.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip content="تنزيل الملف" position="top">
                    <Button
                      onClick={() => handleDownload(file)}
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 h-8 bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="حذف من السجل" position="top">
                    <Button
                      onClick={() => handleDelete(file.id)}
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 h-8 bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileHistory;

// Hook لإدارة السجل
export const useFileHistory = () => {
  const addProcessedFile = (file: ProcessedFile) => {
    const savedFiles = localStorage.getItem('processedFiles');
    let files: ProcessedFile[] = [];
    if (savedFiles) {
      try {
        files = JSON.parse(savedFiles);
      } catch (error) {
        console.error('خطأ في تحميل السجل:', error);
      }
    }
    const updatedFiles = [file, ...files].slice(0, 20);
    localStorage.setItem('processedFiles', JSON.stringify(updatedFiles));
  };

  const clearHistory = () => {
    localStorage.removeItem('processedFiles');
  };

  return { addProcessedFile, clearHistory };
};
