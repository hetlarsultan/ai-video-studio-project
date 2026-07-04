import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LucideIcon, Loader2, Download, Play } from 'lucide-react';
import Tooltip from './Tooltip';
import VideoQualitySelector, { VideoQuality, VideoFormat } from './VideoQualitySelector';

interface FileProcessingCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  onProcess: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  buttonLabel?: string;
  buttonIcon?: LucideIcon;
  successMessage?: string;
  errorMessage?: string;
  variant?: 'primary' | 'secondary' | 'success';
  tooltip?: string;
  onDownload?: (quality: VideoQuality, format: VideoFormat) => void;
  onPreview?: () => void;
  downloadLabel?: string;
  previewLabel?: string;
  showDownloadBtn?: boolean;
  showPreviewBtn?: boolean;
  showQualitySelector?: boolean;
}

export const FileProcessingCard: React.FC<FileProcessingCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  onProcess,
  isLoading = false,
  isDisabled = false,
  buttonLabel = 'معالجة',
  buttonIcon: ButtonIcon,
  variant = 'primary',
  tooltip,
  onDownload,
  onPreview,
  downloadLabel = 'تحميل',
  previewLabel = 'معاينة',
  showDownloadBtn = false,
  showPreviewBtn = false,
  showQualitySelector = false,
}) => {
  const [selectedQuality, setSelectedQuality] = React.useState<VideoQuality>({
    label: '720p - متوسطة',
    value: '720p',
    resolution: '1280x720',
    bitrate: '2500k',
  });
  const [selectedFormat, setSelectedFormat] = React.useState<VideoFormat>({
    label: 'MP4 (الأكثر توافقاً)',
    value: 'mp4',
    extension: '.mp4',
  });

  const variantStyles = {
    primary: 'from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700',
    secondary: 'from-blue-500 via-purple-500 to-pink-600 hover:from-blue-600 hover:via-purple-600 hover:to-pink-700',
    success: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 card-animated">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-cyan-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}

        {/* Quality Selector */}
        {showQualitySelector && (
          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-3">اختر الجودة والصيغة:</p>
            <VideoQualitySelector
              selectedQuality={selectedQuality}
              selectedFormat={selectedFormat}
              onQualityChange={setSelectedQuality}
              onFormatChange={setSelectedFormat}
              disabled={isLoading || isDisabled}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {tooltip ? (
            <Tooltip content={tooltip} position="top">
              <Button
                onClick={onProcess}
                disabled={isLoading || isDisabled}
                className={`flex-1 bg-gradient-to-r ${variantStyles[variant]} text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
                    <span>{buttonLabel}</span>
                  </>
                )}
              </Button>
            </Tooltip>
          ) : (
            <Button
              onClick={onProcess}
              disabled={isLoading || isDisabled}
              className={`flex-1 bg-gradient-to-r ${variantStyles[variant]} text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  {ButtonIcon && <ButtonIcon className="w-5 h-5" />}
                  <span>{buttonLabel}</span>
                </>
              )}
            </Button>
          )}

          {/* Download Button */}
          {showDownloadBtn && onDownload && (
            <Tooltip content={downloadLabel} position="top">
              <Button
                onClick={() => onDownload(selectedQuality, selectedFormat)}
                disabled={isLoading || isDisabled}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow"
              >
                <Download className="w-5 h-5" />
              </Button>
            </Tooltip>
          )}

          {/* Preview Button */}
          {showPreviewBtn && onPreview && (
            <Tooltip content={previewLabel} position="top">
              <Button
                onClick={onPreview}
                disabled={isLoading || isDisabled}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow"
              >
                <Play className="w-5 h-5" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FileProcessingCard;
