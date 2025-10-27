'use client';

import React, { useState } from 'react';
import { Upload, FileImage, X, Loader2 } from 'lucide-react';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentItem {
  [key: string]: string | Date;
  createAt: Date;
}

interface DocumentUploadProps {
  label: string;
  documentType: 'puc' | 'np' | 'insurance' | 'fitness';
  vehicleNumber: string;
  currentDocuments?: DocumentItem[];
  onDocumentChange: (documentType: string, documents: DocumentItem[]) => void;
  onDocumentRemove: (documentType: string, index: number) => void;
  previewUrls?: string[];
  onPreviewChange: (documentType: string, previewUrls: string[]) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  documentType,
  vehicleNumber,
  currentDocuments = [],
  onDocumentChange,
  onDocumentRemove,
  previewUrls = [],
  onPreviewChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
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
        const newDocument: DocumentItem = {
          [`${documentType}Image`]: result.url,
          createAt: new Date()
        };
        
        const updatedDocuments = [...(currentDocuments || []), newDocument];
        const updatedPreviews = [...(previewUrls || []), result.url];
        
        onDocumentChange(documentType, updatedDocuments);
        onPreviewChange(documentType, updatedPreviews);
        
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
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    onDocumentRemove(documentType, index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    onPreviewChange(documentType, updatedPreviews);
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
        {(currentDocuments?.length || 0) > 0 && (
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">{currentDocuments?.length || 0} uploaded</span>
          </div>
        )}
      </div>
      {/* Preview list has been removed as per instruction. */}
      
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentUrl={previewUrls[0] || ''}
        documentType={label}
        documentName={`${label}.pdf`}
      />
    </div>
  );
};
