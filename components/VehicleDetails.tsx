'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentSection } from '@/components/DocumentSection';
import { type Vehicle } from '@/lib/types';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onVehicleUpdate?: (updatedVehicle: Vehicle) => void;
}

export function VehicleDetails({ vehicle, onVehicleUpdate }: VehicleDetailsProps) {
  const [currentVehicle, setCurrentVehicle] = useState(vehicle);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString();
  };

  const handleDocumentsUpdate = (documents: any) => {
    const updatedVehicle = { ...currentVehicle, ...documents };
    setCurrentVehicle(updatedVehicle);
    if (onVehicleUpdate) {
      onVehicleUpdate(updatedVehicle);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Vehicle Number</Label>
            <p className="text-lg font-semibold text-red-600">
              {currentVehicle.vehicleNumber}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Model</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.model}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Make</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.make || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Company Name</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.companyName || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Fuel Type</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.fuelType || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Status</Label>
            <div className="mt-1">
              <Badge className={getStatusColor(currentVehicle.status)}>
                {currentVehicle.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Properties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Physical Properties</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Year</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.year || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Color</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.color || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Seating Capacity</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.seatingCapacity || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Cargo Length</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.cargoLength || '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Technical Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-gray-600">Engine Number</Label>
            <p className="text-lg font-semibold font-mono">
              {currentVehicle.engineNumber || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Chassis Number</Label>
            <p className="text-lg font-semibold font-mono">
              {currentVehicle.chassisNumber || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Vehicle Details</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.vehicleDetails || '--'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">AC Model</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.acModel || '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Location Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Branch</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.branch}
            </p>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Important Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Registration Date</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.registrationDate)}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Insurance Expiry</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.insuranceExpiry)}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Fitness Expiry</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.fitnessExpiry)}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">PUC Expiry</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.pucExpiry)}
            </p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4">
        
        <DocumentSection
          vehicleId={currentVehicle._id?.toString()}
          vehicleNumber={currentVehicle.vehicleNumber}
          documents={{
            pucDocument: currentVehicle.pucDocument,
            npDocument: currentVehicle.npDocument,
            insuranceDocument: currentVehicle.insuranceDocument,
            fitnessDocument: currentVehicle.fitnessDocument,
          }}
          onDocumentChange={(documentType, documents) => {
            const updatedVehicle = { ...currentVehicle, [`${documentType}Document`]: documents };
            setCurrentVehicle(updatedVehicle);
            if (onVehicleUpdate) {
              onVehicleUpdate(updatedVehicle);
            }
          }}
          onDocumentRemove={(documentType, index) => {
            if (index !== undefined) {
              // Remove specific document by index
              const currentDocs = Array.isArray(currentVehicle[`${documentType}Document` as keyof typeof currentVehicle]) 
                ? currentVehicle[`${documentType}Document` as keyof typeof currentVehicle] as any[]
                : [];
              const updatedDocs = currentDocs.filter((_, i) => i !== index);
              const updatedVehicle = { ...currentVehicle, [`${documentType}Document`]: updatedDocs };
              setCurrentVehicle(updatedVehicle);
              if (onVehicleUpdate) {
                onVehicleUpdate(updatedVehicle);
              }
            } else {
              // Remove all documents of this type
              const updatedVehicle = { ...currentVehicle, [`${documentType}Document`]: [] };
              setCurrentVehicle(updatedVehicle);
              if (onVehicleUpdate) {
                onVehicleUpdate(updatedVehicle);
              }
            }
          }}
          onDocumentsUpdate={(documents: any) => {
            const updatedVehicle = { ...currentVehicle, ...documents };
            setCurrentVehicle(updatedVehicle);
            if (onVehicleUpdate) {
              onVehicleUpdate(updatedVehicle);
            }
          }}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentVehicle.pucDocument && (
            <div>
              <Label className="text-gray-600">PUC Document</Label>
              <DocumentPreview
                documents={Array.isArray(currentVehicle.pucDocument) ? currentVehicle.pucDocument : undefined}
                documentUrl={typeof currentVehicle.pucDocument === 'string' ? currentVehicle.pucDocument : undefined}
                documentType="PUC"
                label="PUC Document"
                imageFieldName="pucImage"
              />
            </div>
          )}
          {currentVehicle.insuranceDocument && (
            <div>
              <Label className="text-gray-600">Insurance Document</Label>
              <DocumentPreview
                documents={Array.isArray(currentVehicle.insuranceDocument) ? currentVehicle.insuranceDocument : undefined}
                documentUrl={typeof currentVehicle.insuranceDocument === 'string' ? currentVehicle.insuranceDocument : undefined}
                documentType="Insurance"
                label="Insurance Document"
                imageFieldName="insuranceImage"
              />
            </div>
          )}
          {currentVehicle.fitnessDocument && (
            <div>
              <Label className="text-gray-600">Fitness Document</Label>
              <DocumentPreview
                documents={Array.isArray(currentVehicle.fitnessDocument) ? currentVehicle.fitnessDocument : undefined}
                documentUrl={typeof currentVehicle.fitnessDocument === 'string' ? currentVehicle.fitnessDocument : undefined}
                documentType="Fitness"
                label="Fitness Document"
                imageFieldName="fitnessImage"
              />
            </div>
          )}
          {currentVehicle.npDocument && (
            <div>
              <Label className="text-gray-600">NP Document</Label>
              <DocumentPreview
                documents={Array.isArray(currentVehicle.npDocument) ? currentVehicle.npDocument : undefined}
                documentUrl={typeof currentVehicle.npDocument === 'string' ? currentVehicle.npDocument : undefined}
                documentType="NP"
                label="NP Document"
                imageFieldName="npImage"
              />
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">System Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Created At</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.createdAt)}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Updated At</Label>
            <p className="text-lg font-semibold">
              {formatDate(currentVehicle.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
