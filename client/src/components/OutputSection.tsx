import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Trash2 } from 'lucide-react';

interface OutputSectionProps {
  title: string;
  children: ReactNode;
  onDownload?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
  isVisible?: boolean;
  downloadLabel?: string;
  previewLabel?: string;
}

export const OutputSection: React.FC<OutputSectionProps> = ({
  title,
  children,
  onDownload,
  onPreview,
  onDelete,
  isVisible = true,
  downloadLabel = 'تنزيل',
  previewLabel = 'معاينة',
}) => {
  if (!isVisible) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-200">{title}</h4>
        <div className="flex gap-2">
          {onPreview && (
            <Button
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/50 btn-animated transition-smooth"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewLabel}
            </Button>
          )}
          {onDownload && (
            <Button
              onClick={onDownload}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/30 btn-animated btn-shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadLabel}
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="border-red-600/50 text-red-400 hover:bg-red-600/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default OutputSection;
