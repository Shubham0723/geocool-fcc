'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Save } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentSectionProps {
  vehicleId?: string;
  vehicleNumber: string;
  documents: {
    pucDocument?: string;
    npDocument?: string;
    insuranceDocument?: string;
    fitnessDocument?: string;
  };
  onDocumentChange: (documentType: string, url: string) => void;
  onDocumentRemove: (documentType: string) => void;
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
    puc: string;
    np: string;
    insurance: string;
    fitness: string;
  }>({
    puc: '',
    np: '',
    insurance: '',
    fitness: '',
  });

  const [updatedDocuments, setUpdatedDocuments] = useState(documents);
  const { toast } = useToast();

  const handlePreviewChange = (documentType: string, previewUrl: string) => {
    setDocumentPreviews(prev => ({
      ...prev,
      [documentType]: previewUrl,
    }));
  };

  const handleDocumentChange = (documentType: string, url: string) => {
    setUpdatedDocuments(prev => ({
      ...prev,
      [`${documentType}Document`]: url
    }));
    onDocumentChange(documentType, url);
  };

  const handleDocumentRemove = (documentType: string) => {
    setUpdatedDocuments(prev => ({
      ...prev,
      [`${documentType}Document`]: ''
    }));
    onDocumentRemove(documentType);
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
          currentDocument={updatedDocuments.pucDocument}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrl={documentPreviews.puc}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="NP Document"
          documentType="np"
          vehicleNumber={vehicleNumber}
          currentDocument={updatedDocuments.npDocument}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrl={documentPreviews.np}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="Insurance Document"
          documentType="insurance"
          vehicleNumber={vehicleNumber}
          currentDocument={updatedDocuments.insuranceDocument}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrl={documentPreviews.insurance}
          onPreviewChange={handlePreviewChange}
        />
        
        <DocumentUpload
          label="Fitness Document"
          documentType="fitness"
          vehicleNumber={vehicleNumber}
          currentDocument={updatedDocuments.fitnessDocument}
          onDocumentChange={handleDocumentChange}
          onDocumentRemove={handleDocumentRemove}
          previewUrl={documentPreviews.fitness}
          onPreviewChange={handlePreviewChange}
        />
      </div>
    </div>
  );
};