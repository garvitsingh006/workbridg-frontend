import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  AlertCircle, 
  FileText,
  Download
} from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  currentFile?: File | null;
  uploadedUrl?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
  label?: string;
  description?: string;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  maxSize = 10,
  currentFile,
  uploadedUrl,
  isUploading = false,
  uploadProgress = 0,
  className = '',
  label = 'Upload File',
  description = 'PDF, DOC, DOCX up to 10MB'
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError(null);
    onFileSelect(file);
  }, [maxSize, acceptedTypes, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setLocalError(null);
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>

      <AnimatePresence mode="wait">
        {!currentFile && !uploadedUrl ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
              }
              ${localError ? 'border-red-300 bg-red-50/50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.05 : 1,
                rotate: isDragOver ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Upload className={`w-10 h-10 mx-auto mb-4 ${
                isDragOver ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </motion.div>
            
            <p className={`text-sm mb-2 font-medium ${
              isDragOver ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">{description}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentFile && formatFileSize(currentFile.size)}
                  </p>
                  {uploadedUrl && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {uploadedUrl && (
                  <motion.a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download className="w-4 h-4" />
                  </motion.a>
                )}
                
                <motion.button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-600">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
