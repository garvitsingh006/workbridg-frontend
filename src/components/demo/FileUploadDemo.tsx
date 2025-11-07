import { motion } from 'framer-motion';
import FileUpload from '../common/FileUpload';
import { useFileUpload } from '../../hooks/useFileUpload';
import { toast } from 'react-toastify';

/**
 * Demo component to test the file upload functionality
 * This can be used for testing before integrating into the main app
 */
export default function FileUploadDemo() {
  const resumeUpload = useFileUpload({
    maxSize: 10,
    allowedTypes: ['pdf', 'doc', 'docx'],
    autoUpload: false,
    onUploadSuccess: (url, publicId) => {
      console.log('Upload successful:', { url, publicId });
      toast.success(`File uploaded successfully! URL: ${url}`);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error}`);
    }
  });

  const handleManualUpload = async () => {
    if (resumeUpload.file && !resumeUpload.uploadedUrl) {
      await resumeUpload.uploadFile();
    }
  };

  const handleReset = () => {
    resumeUpload.resetState();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              File Upload Demo
            </h1>
            <p className="text-gray-600">
              Test the resume upload functionality with animations and progress tracking
            </p>
          </div>

          <div className="space-y-6">
            {/* File Upload Component */}
            <FileUpload
              onFileSelect={resumeUpload.handleFileSelect}
              onFileRemove={resumeUpload.removeFile}
              currentFile={resumeUpload.file}
              uploadedUrl={resumeUpload.uploadedUrl}
              isUploading={resumeUpload.isUploading}
              uploadProgress={resumeUpload.uploadProgress}
              label="Resume Upload"
              description="PDF, DOC, DOCX up to 10MB"
              acceptedTypes={['.pdf', '.doc', '.docx']}
              maxSize={10}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {resumeUpload.file && !resumeUpload.uploadedUrl && !resumeUpload.isUploading && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualUpload}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  Upload File
                </motion.button>
              )}

              {resumeUpload.hasError && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resumeUpload.retryUpload}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold"
                >
                  Retry Upload
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold"
              >
                Reset
              </motion.button>
            </div>

            {/* Status Information */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Upload Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">File Selected:</span>
                  <span className={`ml-2 ${resumeUpload.isFileSelected ? 'text-green-600' : 'text-gray-500'}`}>
                    {resumeUpload.isFileSelected ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">File Uploaded:</span>
                  <span className={`ml-2 ${resumeUpload.isFileUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                    {resumeUpload.isFileUploaded ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Upload Progress:</span>
                  <span className="ml-2 text-blue-600">
                    {resumeUpload.uploadProgress}%
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Has Error:</span>
                  <span className={`ml-2 ${resumeUpload.hasError ? 'text-red-600' : 'text-green-600'}`}>
                    {resumeUpload.hasError ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>

              {resumeUpload.file && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">File Details</h4>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Name:</span> {resumeUpload.file.name}</div>
                    <div><span className="font-medium">Size:</span> {resumeUpload.getFileSize()}</div>
                    <div><span className="font-medium">Type:</span> {resumeUpload.file.type}</div>
                  </div>
                </div>
              )}

              {resumeUpload.uploadedUrl && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Upload Successful!</h4>
                  <div className="text-sm">
                    <div><span className="font-medium">URL:</span></div>
                    <div className="break-all text-green-700 bg-white p-2 rounded mt-1">
                      {resumeUpload.uploadedUrl}
                    </div>
                  </div>
                </div>
              )}

              {resumeUpload.error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Error</h4>
                  <div className="text-sm text-red-700">
                    {resumeUpload.error}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Select a PDF, DOC, or DOCX file by clicking or dragging</li>
                <li>Watch the file validation and preview</li>
                <li>Click "Upload File" to test the upload process</li>
                <li>Observe the progress animation and success/error states</li>
                <li>Try different file types and sizes to test validation</li>
                <li>Use "Reset" to clear the state and test again</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This demo requires a backend server with the upload endpoint configured. 
                  If the backend is not running, you'll see upload errors, but you can still test the file selection, 
                  validation, and UI interactions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
