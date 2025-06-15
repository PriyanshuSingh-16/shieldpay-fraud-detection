import { useState, useCallback } from "react";
import { Upload, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number;
  title?: string;
  description?: string;
  icon?: 'upload' | 'image' | 'file';
}

export default function FileUpload({
  onFileSelect,
  acceptedTypes = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  title = "Upload File",
  description = "Drag and drop or click to browse",
  icon = 'upload'
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const icons = {
    upload: Upload,
    image: Image,
    file: FileText
  };

  const Icon = icons[icon];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Validate file type
    if (acceptedTypes !== "*" && !file.type.match(acceptedTypes)) {
      setError(`File type not supported. Accepted types: ${acceptedTypes}`);
      return;
    }

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onFileSelect(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-gray-600 hover:border-primary'
        }`}
      >
        <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        
        <input
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileInput}
          id="file-upload"
        />
        
        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
          className="shield-bg-primary hover:bg-blue-700"
        >
          {isUploading ? 'Processing...' : 'Choose File'}
        </Button>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Processing file...</span>
            <span className="text-sm text-gray-300">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
