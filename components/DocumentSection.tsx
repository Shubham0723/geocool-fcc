'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Save } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentItem {
  [key: string]: string | Date;
  createAt: Date;
}

interface DocumentSectionProps {
  vehicleId?: string;
  vehicleNumber: string;
  documents: {
    pucDocument?: DocumentItem[] | string; // Support both array and legacy string format
    npDocument?: DocumentItem[] | string;
    insuranceDocument?: DocumentItem[] | string;
    fitnessDocument?: DocumentItem[] | string;
  };
  onDocumentChange: (documentType: string, documents: DocumentItem[]) => void;
  onDocumentRemove: (documentType: string, index?: number) => void;
  onDocumentsUpdate?: (documents: any) => void;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  vehicleId,
  vehicleNumber,
  documents,
  onDocumentChange,
  onDocumentRemove,
  onDocumentsUpdate,
}) => {
  const [documentPreviews, setDocumentPreviews] = useState<{
    puc: string[];
    np: string[];
    insurance: string[];
    fitness: string[];
  }>({
    puc: [],
    np: [],
    insurance: [],
    fitness: [],
  });

  const [updatedDocuments, setUpdatedDocuments] = useState(documents);
  const { toast } = useToast();

  // Helper function to convert legacy string format to array format
  const normalizeDocuments = (docs: DocumentItem[] | string | undefined): DocumentItem[] => {
    if (!docs) return [];
    if (typeof docs === 'string') return []; // Legacy format, return empty array
    return docs;
  };

  const handlePreviewChange = (documentType: string, previewUrls: string[]) => {
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: previewUrls,
    }));
  };

  const handleDocumentChange = (documentType: string, documents: DocumentItem[]) => {
    setUpdatedDocuments(prev => ({
      ...prev,
      [`${documentType}Document`]: documents
    }));
    onDocumentChange(documentType, documents);
  };

  const handleDocumentRemove = (documentType: string, index?: number) => {
    if (index !== undefined) {
      // Remove specific document by index
      const currentDocs = normalizeDocuments(updatedDocuments[`${documentType}Document` as keyof typeof updatedDocuments] as DocumentItem[]);
      const updatedDocs = currentDocs.filter((_, i) => i !== index);
      setUpdatedDocuments(prev => ({
        ...prev,
        [`${documentType}Document`]: updatedDocs
      }));
      onDocumentChange(documentType, updatedDocs);
    } else {
      // Remove all documents of this type
      setUpdatedDocuments(prev => ({
        ...prev,
        [`${documentType}Document`]: []
      }));
      onDocumentChange(documentType, []);
    }
  };

  const handleSaveDocuments = async () => {
    if (!vehicleId) {
      toast({
        title: 'Error',
        description: 'Vehicle ID is required to save documents',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDocuments),
      });

      if (response.ok) {
        if (onDocumentsUpdate) {
          onDocumentsUpdate(updatedDocuments);
        }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Document Uploads
        </h3>
        <Button
          onClick={handleSaveDocuments}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Documents
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DocumentUpload
          label="PUC Document"
          documentType="puc"
          vehicleNumber={vehicleNumber}
          currentDocuments={normalizeDocuments(updatedDocuments.pucDocument)}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrls={documentPreviews.puc}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="NP Document"
          documentType="np"
          vehicleNumber={vehicleNumber}
          currentDocuments={normalizeDocuments(updatedDocuments.npDocument)}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrls={documentPreviews.np}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="Insurance Document"
          documentType="insurance"
          vehicleNumber={vehicleNumber}
          currentDocuments={normalizeDocuments(updatedDocuments.insuranceDocument)}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrls={documentPreviews.insurance}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="Fitness Document"
          documentType="fitness"
          vehicleNumber={vehicleNumber}
          currentDocuments={normalizeDocuments(updatedDocuments.fitnessDocument)}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrls={documentPreviews.fitness}
          onPreviewChange={handlePreviewChange}
        />
      </div>
    </div>
  );
};