'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Download, ExternalLink } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentType: string;
  documentName?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentType,
  documentName,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName || `${documentType}_document.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank');
  };

  const isPdf = documentUrl.toLowerCase().includes('.pdf') || 
                documentUrl.includes('pdf') ||
                documentType.toLowerCase().includes('pdf');

  // Check if file type is previewable in browser
  const isImage = documentType.toLowerCase().includes('image') || 
                  documentType.toLowerCase().includes('jpeg') ||
                  documentType.toLowerCase().includes('jpg') ||
                  documentType.toLowerCase().includes('png') ||
                  documentType.toLowerCase().includes('gif') ||
                  documentType.toLowerCase().includes('webp');
  
  // Check if it's an Office document that can be previewed
  const isOfficeDoc = documentType.toLowerCase().includes('wordprocessingml') ||
                      documentType.toLowerCase().includes('spreadsheetml') ||
                      documentType.toLowerCase().includes('word') ||
                      documentType.toLowerCase().includes('excel') ||
                      documentType.toLowerCase().includes('docx') ||
                      documentType.toLowerCase().includes('xlsx') ||
                      documentType.toLowerCase().includes('pptx');
  
  const isPreviewable = isPdf || isImage || isOfficeDoc;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {documentType} Document Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                {/* <X className="h-4 w-4" /> */}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {!isPreviewable ? (
            // Non-previewable files (DOCX, etc.) - show download option
            <div className="flex items-center justify-center h-[70vh] border rounded-lg">
              <div className="text-center">
                <div className="text-blue-600 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-2 font-semibold">Document ready to download</p>
                <p className="text-gray-500 text-sm mb-4">This file type cannot be previewed in browser</p>
                <Button onClick={handleDownload} variant="default" className="bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}
              {error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-600 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-red-600 mb-2">Failed to load PDF</p>
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <Button onClick={handleOpenInNewTab} variant="outline">
                      Open in New Tab Instead
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('Unable to display PDF in this browser. Please use the "Open in New Tab" button.');
                    setIsLoading(false);
                  }}
                  title={`${documentType} Document Preview`}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              {isImage ? (
                <img
                  src={documentUrl}
                  alt={`${documentType} Document`}
                  className="w-full h-full object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('Unable to load image');
                    setIsLoading(false);
                  }}
                />
              ) : isOfficeDoc ? (
                // Use Office Online Viewer for DOCX, XLSX, etc.
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
                  className="w-full h-full"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('Unable to preview Office document');
                    setIsLoading(false);
                  }}
                  title={`${documentType} Document Preview`}
                />
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
