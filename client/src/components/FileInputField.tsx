import React from 'react';
import { Upload } from 'lucide-react';

interface FileInputFieldProps {
  label: string;
  placeholder?: string;
  type?: 'file' | 'textarea';
  accept?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
}

export const FileInputField: React.FC<FileInputFieldProps> = ({
  label,
  placeholder,
  type = 'file',
  accept,
  multiple = false,
  onChange,
  value,
  disabled = false,
  icon,
  helperText,
}) => {
  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
        <textarea
          placeholder={placeholder}
          onChange={onChange as any}
          value={value}
          disabled={disabled}
          className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {helperText && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-200">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg p-4 text-white file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:cursor-pointer file:font-semibold hover:border-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Upload className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      {helperText && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

export default FileInputField;
