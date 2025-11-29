
import React, { useState, useRef } from 'react';
import { UploadCloudIcon } from '../icons';
import { cn } from '../../lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  label?: string;
  subLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = "image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif",
  disabled = false,
  className,
  activeClassName,
  label = "Klik untuk unggah atau seret foto",
  subLabel,
  icon,
  variant = 'default'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer',
          disabled && 'cursor-not-allowed opacity-60 bg-stone-100 dark:bg-stone-800',
          !disabled && isDragging && 'border-solid border-stone-600 dark:border-stone-400 bg-stone-100 dark:bg-stone-800',
          !disabled && !isDragging && 'border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-stone-500 dark:text-stone-400',
          activeClassName && isDragging ? activeClassName : '',
          className
        )}
      >
        {icon || <UploadCloudIcon className="w-6 h-6 mb-1" />}
        <span className="text-xs text-center font-semibold">{label}</span>
        {subLabel && <span className="text-[10px] text-center mt-1 opacity-70">{subLabel}</span>}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        isDragging
          ? "border-stone-800 bg-stone-100 dark:border-stone-200 dark:bg-stone-800"
          : "border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900",
        className
      )}
    >
      <div className="w-16 h-16 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon || <UploadCloudIcon className="w-8 h-8 text-stone-600 dark:text-stone-400" />}
      </div>
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{label}</p>
      {subLabel && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{subLabel}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};
