'use client';

import React, { useState } from 'react';
import { FileImage, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { MultiDocumentPreviewModal } from './MultiDocumentPreviewModal';

interface DocumentItem {
  [key: string]: string | Date;
  createAt: Date;
}

interface DocumentPreviewProps {
  documentType: string;
  documentUrl?: string; // For backward compatibility
  documents?: DocumentItem[]; // New array format
  label: string;
  imageFieldName?: string; // e.g., 'pucImage', 'npImage', etc.
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentType,
  documentUrl,
  documents,
  label,
  imageFieldName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);

  // Determine if we're using the new array format or legacy single document format
  const isArrayFormat = documents && documents.length > 0;
  const hasDocuments = isArrayFormat || documentUrl;

  const handleViewDocument = () => {
    if (isArrayFormat) {
      setIsMultiModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleOpenInNewTab = () => {
    if (isArrayFormat && documents && documents.length > 0) {
      const firstDoc = documents[0];
      const url = firstDoc[imageFieldName || `${documentType.toLowerCase()}Image`] as string;
      window.open(url, '_blank');
    } else if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (!hasDocuments) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
        <FileImage className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">{label}: No documents uploaded</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
        <FileImage className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-gray-700">{label}:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDocument}
          className="h-6 px-2 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Documents
          {isArrayFormat && documents && documents.length > 1 && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
              {documents.length}
            </span>
          )}
        </Button>
      </div>
      
      {/* Legacy single document modal */}
      {documentUrl && (
        <DocumentPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          documentUrl={documentUrl}
          documentType={documentType}
          documentName={`${label}.pdf`}
        />
      )}
      
      {/* New multi-document modal */}
      {isArrayFormat && documents && (
        <MultiDocumentPreviewModal
          isOpen={isMultiModalOpen}
          onClose={() => setIsMultiModalOpen(false)}
          documents={documents}
          documentType={documentType}
          imageFieldName={imageFieldName || `${documentType.toLowerCase()}Image`}
        />
      )}
    </>
  );
};
