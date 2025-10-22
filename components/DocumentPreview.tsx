'use client';

import React, { useState } from 'react';
import { FileImage, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DocumentPreviewProps {
  documentType: string;
  documentUrl: string;
  label: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentType,
  documentUrl,
  label,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDocument = () => {
    setIsModalOpen(true);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank');
  };

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
          View Document
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenInNewTab}
          className="h-6 px-2 text-gray-600 hover:text-gray-800"
        >
          Open in New Tab
        </Button>
      </div>
      
      <DocumentPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentUrl={documentUrl}
        documentType={documentType}
        documentName={`${label}.pdf`}
      />
    </>
  );
};
