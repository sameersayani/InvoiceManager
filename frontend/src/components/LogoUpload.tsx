import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { logoAPI } from '../services/api';

interface LogoUploadProps {
  onLogoUpload: (logoUrl: string) => void;
  currentLogo?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoUpload, currentLogo }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or SVG.');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Upload file
      const response = await logoAPI.uploadLogo(file);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      onLogoUpload(objectUrl);
      
      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, [onLogoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.svg']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleDeleteLogo = async () => {
    try {
      await logoAPI.deleteLogo();
      onLogoUpload('');
      setSuccess('Logo deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete logo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        {currentLogo && (
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={currentLogo}
                alt="Company logo"
                className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
              />
              <button
                onClick={handleDeleteLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Delete logo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-2">
              <svg className="w-12 h-12 text-primary-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-primary-600 font-medium">Drop the logo here</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG, or GIF (max. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{success}</p>
        </div>
      )}
    </div>
  );
};