import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import uploadService, { type UploadProgress, type UploadResponse } from '../services/uploadService';

interface UseFileUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onUploadSuccess?: (url: string, publicId?: string) => void;
  onUploadError?: (error: string) => void;
  autoUpload?: boolean; // Whether to upload immediately after file selection
}

interface FileUploadState {
  file: File | null;
  uploadedUrl: string | null;
  publicId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useFileUpload({
  maxSize = 10,
  allowedTypes = ['pdf', 'doc', 'docx'],
  onUploadSuccess,
  onUploadError,
  autoUpload = false
}: UseFileUploadOptions = {}) {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    uploadedUrl: null,
    publicId: null,
    isUploading: false,
    uploadProgress: 0,
    error: null
  });

  const resetState = useCallback(() => {
    setState({
      file: null,
      uploadedUrl: null,
      publicId: null,
      isUploading: false,
      uploadProgress: 0,
      error: null
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = uploadService.validateFile(file, maxSize, allowedTypes);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      onUploadError?.(validation.error || 'Invalid file');
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Update state with selected file
    setState(prev => ({
      ...prev,
      file,
      error: null,
      uploadProgress: 0
    }));

    // Auto upload if enabled
    if (autoUpload) {
      await uploadFile(file);
    }
  }, [maxSize, allowedTypes, autoUpload, onUploadError]);

  const uploadFile = useCallback(async (fileToUpload?: File) => {
    const targetFile = fileToUpload || state.file;
    if (!targetFile) {
      const error = 'No file selected for upload';
      setState(prev => ({ ...prev, error }));
      onUploadError?.(error);
      toast.error(error);
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadProgress: 0, 
      error: null 
    }));

    try {
      const response: UploadResponse = await uploadService.uploadFile(
        targetFile,
        (progress: UploadProgress) => {
          setState(prev => ({ 
            ...prev, 
            uploadProgress: progress.percentage 
          }));
        }
      );

      if (response.success && response.url) {
        setState(prev => ({
          ...prev,
          uploadedUrl: response.url || null,
          publicId: response.publicId || null,
          isUploading: false,
          uploadProgress: 100
        }));

        onUploadSuccess?.(response.url, response.publicId);
        toast.success('File uploaded successfully!');
        return response.url;
      } else {
        const error = response.error || 'Upload failed';
        setState(prev => ({ 
          ...prev, 
          error, 
          isUploading: false, 
          uploadProgress: 0 
        }));
        onUploadError?.(error);
        toast.error(error);
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isUploading: false, 
        uploadProgress: 0 
      }));
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [state.file, onUploadSuccess, onUploadError]);

  const removeFile = useCallback(async () => {
    // If file was uploaded to Cloudinary, delete it
    if (state.publicId) {
      try {
        await uploadService.deleteFile(state.publicId);
        toast.success('File removed successfully');
      } catch (error) {
        console.error('Failed to delete file from Cloudinary:', error);
        // Don't show error to user as the local state will still be reset
      }
    }

    resetState();
  }, [state.publicId, resetState]);

  const retryUpload = useCallback(async () => {
    if (state.file) {
      await uploadFile(state.file);
    }
  }, [state.file, uploadFile]);

  // Utility functions
  const getFileSize = useCallback(() => {
    return state.file ? uploadService.formatFileSize(state.file.size) : null;
  }, [state.file]);

  const getFileIcon = useCallback(() => {
    return state.file ? uploadService.getFileIcon(state.file.name) : null;
  }, [state.file]);

  const isFileSelected = Boolean(state.file);
  const isFileUploaded = Boolean(state.uploadedUrl);
  const hasError = Boolean(state.error);

  return {
    // State
    file: state.file,
    uploadedUrl: state.uploadedUrl,
    publicId: state.publicId,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error,

    // Actions
    handleFileSelect,
    uploadFile,
    removeFile,
    retryUpload,
    resetState,

    // Computed values
    isFileSelected,
    isFileUploaded,
    hasError,
    getFileSize,
    getFileIcon,

    // Utils
    formatFileSize: uploadService.formatFileSize,
    validateFile: uploadService.validateFile
  };
}
