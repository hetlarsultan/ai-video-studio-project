import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';

export interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
  bitrate: string;
}

export interface VideoFormat {
  label: string;
  value: string;
  extension: string;
}

interface VideoQualitySelectorProps {
  onQualityChange?: (quality: VideoQuality) => void;
  onFormatChange?: (format: VideoFormat) => void;
  selectedQuality?: VideoQuality;
  selectedFormat?: VideoFormat;
  disabled?: boolean;
}

const VIDEO_QUALITIES: VideoQuality[] = [
  { label: '360p - منخفضة', value: '360p', resolution: '640x360', bitrate: '500k' },
  { label: '720p - متوسطة', value: '720p', resolution: '1280x720', bitrate: '2500k' },
  { label: '1080p - عالية', value: '1080p', resolution: '1920x1080', bitrate: '5000k' },
  { label: '4K - فائقة', value: '4k', resolution: '3840x2160', bitrate: '15000k' },
];

const VIDEO_FORMATS: VideoFormat[] = [
  { label: 'MP4 (الأكثر توافقاً)', value: 'mp4', extension: '.mp4' },
  { label: 'WebM (أصغر حجم)', value: 'webm', extension: '.webm' },
  { label: 'AVI (عالي الجودة)', value: 'avi', extension: '.avi' },
  { label: 'MOV (Apple)', value: 'mov', extension: '.mov' },
];

export const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  onQualityChange,
  onFormatChange,
  selectedQuality = VIDEO_QUALITIES[1],
  selectedFormat = VIDEO_FORMATS[0],
  disabled = false,
}) => {
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleQualitySelect = (quality: VideoQuality) => {
    onQualityChange?.(quality);
    setShowQualityMenu(false);
  };

  const handleFormatSelect = (format: VideoFormat) => {
    onFormatChange?.(format);
    setShowFormatMenu(false);
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Quality Selector */}
      <div className="relative">
        <Tooltip content="اختر جودة الفيديو" position="top">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            disabled={disabled}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow"
          >
            <span className="text-sm">📊 {selectedQuality.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Quality Dropdown Menu */}
        {showQualityMenu && (
          <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
            {VIDEO_QUALITIES.map((quality) => (
              <button
                key={quality.value}
                onClick={() => handleQualitySelect(quality)}
                className={`w-full text-right px-4 py-2 transition-colors duration-200 ${
                  selectedQuality.value === quality.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <span>{quality.label}</span>
                  <span className="text-xs text-slate-400">{quality.resolution}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">معدل البت: {quality.bitrate}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Format Selector */}
      <div className="relative">
        <Tooltip content="اختر صيغة الفيديو" position="top">
          <button
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            disabled={disabled}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-animated btn-shadow"
          >
            <span className="text-sm">📁 {selectedFormat.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Format Dropdown Menu */}
        {showFormatMenu && (
          <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
            {VIDEO_FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => handleFormatSelect(format)}
                className={`w-full text-right px-4 py-2 transition-colors duration-200 ${
                  selectedFormat.value === format.value
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <span>{format.label}</span>
                  <span className="text-xs text-slate-400 font-mono">{format.extension}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Display */}
      <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <span>📝 معلومات:</span>
          <span className="text-cyan-400">{selectedQuality.resolution}</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400">{selectedFormat.extension}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoQualitySelector;
