'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileImage, X, Loader2, Save } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  vehicleId: string;
  vehicleNumber: string;
  documents: {
    pucDocument?: string;
    npDocument?: string;
    insuranceDocument?: string;
    fitnessDocument?: string;
  };
  onDocumentsUpdate: (documents: any) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  vehicleId,
  vehicleNumber,
  documents,
  onDocumentsUpdate,
}) => {
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const [updatedDocuments, setUpdatedDocuments] = useState(documents);
  const { toast } = useToast();

  // Initialize previews from existing documents on component mount
  useEffect(() => {
    const initialPreviews: {[key: string]: string} = {};
    
    if (documents.pucDocument) {
      initialPreviews.puc = documents.pucDocument;
    }
    if (documents.npDocument) {
      initialPreviews.np = documents.npDocument;
    }
    if (documents.insuranceDocument) {
      initialPreviews.insurance = documents.insuranceDocument;
    }
    if (documents.fitnessDocument) {
      initialPreviews.fitness = documents.fitnessDocument;
    }
    
    setDocumentPreviews(initialPreviews);
  }, [documents]);

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      // Create preview URL for images, or set PDF preview for PDF files
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setDocumentPreviews(prev => ({ ...prev, [documentType]: preview }));
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we'll set a special preview that indicates it's a PDF
        setDocumentPreviews(prev => ({ ...prev, [documentType]: 'pdf://' + file.name }));
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
        setUpdatedDocuments(prev => ({
          ...prev,
          [`${documentType}Document`]: result.url
        }));
        
        // Update preview with the Google Cloud Storage URL for persistence
        setDocumentPreviews(prev => ({
          ...prev,
          [documentType]: result.url
        }));
        
        toast({
          title: 'Success',
          description: `${documentType.toUpperCase()} document uploaded successfully`,
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
      if (documentPreviews[documentType]) {
        URL.revokeObjectURL(documentPreviews[documentType]);
        setDocumentPreviews(prev => ({ ...prev, [documentType]: '' }));
      }
    } finally {
      setIsUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleRemoveDocument = (documentType: string) => {
    setUpdatedDocuments(prev => ({
      ...prev,
      [`${documentType}Document`]: ''
    }));
    
    // Clear the preview
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: ''
    }));
  };

  const handleSaveDocuments = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDocuments),
      });

      if (response.ok) {
        onDocumentsUpdate(updatedDocuments);
        toast({
          title: 'Success',
          description: 'Documents saved successfully',
        });
      } else {
        throw new Error('Failed to save documents');
      }
    } catch (error) {
      console.error('Error saving documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to save documents',
        variant: 'destructive',
      });
    }
  };

  const renderDocumentUpload = (label: string, documentType: string, currentDocument?: string) => (
    <div className="space-y-2">
      <Label className="text-gray-600">{label}</Label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          id={`${documentType}-upload-modal`}
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, documentType);
          }}
          className="hidden"
          disabled={isUploading[documentType]}
        />
        <label
          htmlFor={`${documentType}-upload-modal`}
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-sm ${
            isUploading[documentType] ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading[documentType] ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading[documentType] ? 'Uploading...' : `Upload ${label}`}
        </label>
        
        {updatedDocuments[`${documentType}Document` as keyof typeof updatedDocuments] && (
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Uploaded</span>
            <button
              type="button"
              onClick={() => handleRemoveDocument(documentType)}
              className="text-red-600 hover:text-red-800 transition-colors"
              disabled={isUploading[documentType]}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {documentPreviews[documentType] && (
        <div className="mt-2">
          {documentPreviews[documentType].includes('googleapis.com') || 
           documentPreviews[documentType].includes('storage.googleapis.com') ? (
            // Check if it's a PDF file
            documentPreviews[documentType].toLowerCase().includes('.pdf') || 
            documentPreviews[documentType].includes('pdf') ? (
              // Show PDF preview
              <div className="w-24 h-16 bg-gray-100 rounded border flex flex-col items-center justify-center relative group">
                <svg className="w-8 h-8 text-red-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-600 font-medium">PDF</span>
                <button
                  onClick={() => window.open(documentPreviews[documentType], '_blank')}
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title="View PDF"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              // Show image preview for Google Cloud Storage URLs
              <img
                src={documentPreviews[documentType]}
                alt={`${label} Preview`}
                className="w-24 h-16 object-cover rounded border"
                onError={(e) => {
                  // If it's not an image, show a document icon instead
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-24 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            )
          ) : (
            // Check if it's a PDF file for local uploads
            documentPreviews[documentType].toLowerCase().includes('.pdf') || 
            documentPreviews[documentType].startsWith('pdf://') ? (
              // Show PDF preview for local files
              <div className="w-24 h-16 bg-gray-100 rounded border flex flex-col items-center justify-center relative group">
                <svg className="w-8 h-8 text-red-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-600 font-medium">PDF</span>
                <button
                  onClick={() => {
                    // For local PDF files, we can't open them directly, so show a message
                    alert('PDF will be available for viewing after upload');
                  }}
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title="PDF Preview"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              // Show image preview for local file URLs (temporary uploads)
              <img
                src={documentPreviews[documentType]}
                alt={`${label} Preview`}
                className="w-24 h-16 object-cover rounded border"
              />
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Document Uploads</h3>
        <Button
          onClick={handleSaveDocuments}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Documents
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {renderDocumentUpload('PUC Document', 'puc', updatedDocuments.pucDocument)}
        {renderDocumentUpload('NP Document', 'np', updatedDocuments.npDocument)}
        {renderDocumentUpload('Insurance Document', 'insurance', updatedDocuments.insuranceDocument)}
        {renderDocumentUpload('Fitness Document', 'fitness', updatedDocuments.fitnessDocument)}
      </div>
    </div>
  );
};
