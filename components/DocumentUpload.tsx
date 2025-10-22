'use client';

import React, { useState } from 'react';
import { Upload, FileImage, X, Loader2 } from 'lucide-react';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentUploadProps {
  label: string;
  documentType: 'puc' | 'np' | 'insurance' | 'fitness';
  vehicleNumber: string;
  currentDocument?: string;
  onDocumentChange: (documentType: string, url: string) => void;
  onDocumentRemove: (documentType: string) => void;
  previewUrl?: string;
  onPreviewChange: (documentType: string, previewUrl: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  documentType,
  vehicleNumber,
  currentDocument,
  onDocumentChange,
  onDocumentRemove,
  previewUrl,
  onPreviewChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create preview URL for images, or set PDF preview for PDF files
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        onPreviewChange(documentType, preview);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we'll set a special preview that indicates it's a PDF
        onPreviewChange(documentType, 'pdf://' + file.name);
      }

      // Upload file via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('vehicleNumber', vehicleNumber);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.url) {
        onDocumentChange(documentType, result.url);
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
      // Remove preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        onPreviewChange(documentType, '');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = () => {
    onDocumentRemove(documentType);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      onPreviewChange(documentType, '');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          id={`${documentType}-upload`}
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
          disabled={isUploading}
        />
        <label
          htmlFor={`${documentType}-upload`}
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : `Upload ${label}`}
        </label>
        
        {currentDocument && (
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Uploaded</span>
            <button
              type="button"
              onClick={handleRemoveDocument}
              className="text-red-600 hover:text-red-800 transition-colors"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className="mt-2">
          {previewUrl.startsWith('pdf://') || previewUrl.toLowerCase().includes('.pdf') ? (
            // Show PDF preview
              <div className="w-32 h-20 bg-gray-100 rounded border flex flex-col items-center justify-center relative group cursor-pointer">
                <svg className="w-8 h-8 text-red-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-600 font-medium">PDF</span>
                <button
                  onClick={() => {
                    if (previewUrl.startsWith('pdf://')) {
                      alert('PDF will be available for viewing after upload');
                    } else {
                      setIsPreviewModalOpen(true);
                    }
                  }}
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title="View PDF"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
          ) : (
            // Show image preview
            <img
              src={previewUrl}
              alt={`${label} Preview`}
              className="w-32 h-20 object-cover rounded border"
            />
          )}
        </div>
      )}
      
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentUrl={previewUrl || ''}
        documentType={label}
        documentName={`${label}.pdf`}
      />
    </div>
  );
};
