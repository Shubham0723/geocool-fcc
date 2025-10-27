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
    pucDocument?: Array<{ pucImage: string; createAt: Date }>;
    npDocument?: Array<{ npImage: string; createAt: Date }>;
    insuranceDocument?: Array<{ insuranceImage: string; createAt: Date }>;
    fitnessDocument?: Array<{ fitnessImage: string; createAt: Date }>;
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
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string[]}>({});
  const [updatedDocuments, setUpdatedDocuments] = useState(documents);
  const { toast } = useToast();

  // Initialize previews from existing documents on component mount
  useEffect(() => {
    const initialPreviews: {[key: string]: string[]} = {};
    
    if (documents.pucDocument) {
      initialPreviews.puc = documents.pucDocument.map(doc => doc.pucImage);
    }
    if (documents.npDocument) {
      initialPreviews.np = documents.npDocument.map(doc => doc.npImage);
    }
    if (documents.insuranceDocument) {
      initialPreviews.insurance = documents.insuranceDocument.map(doc => doc.insuranceImage);
    }
    if (documents.fitnessDocument) {
      initialPreviews.fitness = documents.fitnessDocument.map(doc => doc.fitnessImage);
    }
    
    setDocumentPreviews(initialPreviews);
  }, [documents]);

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      // Create preview URL for images, or set PDF preview for PDF files
      let previewUrl = '';
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        previewUrl = 'pdf://' + file.name;
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
        const newDocument = {
          [`${documentType}Image`]: result.url,
          createAt: new Date()
        };

        setUpdatedDocuments(prev => ({
          ...prev,
          [`${documentType}Document`]: [
            ...(prev[`${documentType}Document` as keyof typeof prev] || []),
            newDocument
          ]
        }));
        
        // Update preview with the new document
        setDocumentPreviews(prev => ({
          ...prev,
          [documentType]: [...(prev[documentType] || []), result.url]
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
    } finally {
      setIsUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleRemoveDocument = (documentType: string, index: number) => {
    setUpdatedDocuments(prev => {
      const currentDocs = prev[`${documentType}Document` as keyof typeof prev] || [];
      const newDocs = currentDocs.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [`${documentType}Document`]: newDocs
      };
    });
    
    // Remove from preview
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: prev[documentType].filter((_: string, i: number) => i !== index)
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

  const renderDocumentUpload = (label: string, documentType: string) => {
    const currentDocs = updatedDocuments[`${documentType}Document` as keyof typeof updatedDocuments] || [];
    const previews = documentPreviews[documentType] || [];

    return (
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
        </div>
        
        {/* Display multiple documents */}
        {previews.length > 0 && (
          <div className="mt-2 space-y-2">
            {previews.map((preview, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <FileImage className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 flex-1">
                  {label} #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(documentType, index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  disabled={isUploading[documentType]}
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.open(preview, '_blank')}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        {renderDocumentUpload('PUC Document', 'puc')}
        {renderDocumentUpload('NP Document', 'np')}
        {renderDocumentUpload('Insurance Document', 'insurance')}
        {renderDocumentUpload('Fitness Document', 'fitness')}
      </div>
    </div>
  );
};
