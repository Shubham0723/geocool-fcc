'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Download, ExternalLink, Calendar } from 'lucide-react';

// Fix for TypeScript iframe issue
declare global {
  namespace JSX {
    interface IntrinsicElements {
      iframe: React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
    }
  }
}

interface DocumentItem {
  [key: string]: string | Date;
  createAt: Date;
}

interface MultiDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  documentType: string;
  imageFieldName: string; // e.g., 'pucImage', 'npImage', etc.
}

export const MultiDocumentPreviewModal: React.FC<MultiDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documents,
  documentType,
  imageFieldName,
}) => {
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDocument = documents[selectedDocumentIndex];
  const documentUrl = selectedDocument?.[imageFieldName] as string;

  const handleDownload = (url: string, index: number) => {
    const nameFromUrl = url.split('?')[0].split('/').pop() || `${documentType}_document_${index + 1}`;
    const fileName = nameFromUrl;
    const api = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = api;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const isPdf = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.includes('pdf');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {documentType} Documents ({documents.length} files)
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenInNewTab(documentUrl)}
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

        <div className="flex gap-4 h-[70vh]">
          {/* Document List Sidebar */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-3 text-gray-700">All Documents</h3>
            <div className="space-y-2">
              {documents.map((doc, index) => {
                const url = doc[imageFieldName] as string;
                const isSelected = index === selectedDocumentIndex;
                const isPdfFile = isPdf(url);

                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => setSelectedDocumentIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {isPdfFile ? (
                          <div className="text-red-600 font-bold text-xs">PDF</div>
                        ) : (
                          <Image
                            src={url}
                            alt={`${documentType} ${index + 1}`}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        <div className="hidden text-gray-500 text-xs">IMG</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {documentType} Document #{index + 1}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.createAt)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(url, index);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInNewTab(url);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Preview Area */}
          <div className="flex-1 overflow-hidden">
            {isPdf(documentUrl) ? (
              <div className="w-full h-full border rounded-lg overflow-hidden">
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
                      <Button onClick={() => handleOpenInNewTab(documentUrl)} variant="outline">
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
              <div className="w-full h-full border rounded-lg overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={documentUrl}
                    alt={`${documentType} Document`}
                    fill
                    className="object-contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setError('Unable to load image');
                      setIsLoading(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
