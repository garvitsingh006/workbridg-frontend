import api from '../api.js';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

class UploadService {
  /**
   * Upload file to Cloudinary via backend
   * @param file - File to upload
   * @param onProgress - Progress callback
   * @returns Promise with upload response
   */
  async uploadFile(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add file metadata
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size.toString());
      formData.append('fileType', file.type);

      const response = await api.post('/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        },
      });

      console.log('Upload response:', response.data);

      // Check if the response is successful (200 status means success)
      if (response.status === 200 && response.data) {
        // Handle the actual backend response structure
        const responseData = response.data;
        
        // Check if response indicates success
        if (responseData.success === true && responseData.data) {
          return {
            success: true,
            url: responseData.data.viewUrl || responseData.data.downloadUrl || responseData.data.originalUrl,
            publicId: responseData.data.publicId
          };
        }
        
        // Fallback: If response has success field and it's true (direct structure)
        if (responseData.success === true) {
          return {
            success: true,
            url: responseData.url || responseData.viewUrl || responseData.downloadUrl,
            publicId: responseData.publicId || responseData.public_id
          };
        }
        
        // If response has url field (indicating successful upload)
        if (responseData.url) {
          return {
            success: true,
            url: responseData.url,
            publicId: responseData.publicId || responseData.public_id
          };
        }
        
        // If we get here, the response structure is unexpected but status is 200
        console.warn('Unexpected response structure:', responseData);
        return {
          success: true,
          url: responseData.secure_url || responseData.url || '', // Cloudinary often returns secure_url
          publicId: responseData.public_id || responseData.publicId || ''
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Upload failed'
        };
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Upload failed. Please try again.'
      };
    }
  }

  /**
   * Delete file from Cloudinary via backend
   * @param publicId - Cloudinary public ID
   * @returns Promise with deletion response
   */
  async deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.delete(`/upload/resume/${publicId}`);
      
      console.log('Delete response:', response.data);
      
      // Check if the response is successful (200 status means success)
      if (response.status === 200) {
        return {
          success: response.data?.success !== false // Consider success unless explicitly false
        };
      }
      
      return {
        success: response.data?.success || false
      };
    } catch (error: any) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete file'
      };
    }
  }

  /**
   * Validate file before upload
   * @param file - File to validate
   * @param maxSize - Maximum file size in MB (default: 10)
   * @param allowedTypes - Allowed file extensions (default: pdf, doc, docx)
   * @returns Validation result
   */
  validateFile(
    file: File, 
    maxSize: number = 10, 
    allowedTypes: string[] = ['pdf', 'doc', 'docx']
  ): { isValid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSize}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type not supported. Please upload: ${allowedTypes.map(type => type.toUpperCase()).join(', ')}`
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty. Please select a valid file.'
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   * @param fileName - Name of the file
   * @returns Icon identifier
   */
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      default:
        return 'file';
    }
  }

  /**
   * Generate preview URL for supported file types
   * @param file - File to generate preview for
   * @returns Promise with preview URL or null
   */
  async generatePreview(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        resolve(null);
      };

      // Only generate preview for images (if needed in future)
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  }
}

export const uploadService = new UploadService();
export default uploadService;
