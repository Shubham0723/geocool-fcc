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
    if (!date) return 'N/A';
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
              {currentVehicle.make || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Company Name</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.companyName || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Fuel Type</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.fuelType || 'N/A'}
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
              {currentVehicle.year || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Color</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.color || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Seating Capacity</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.seatingCapacity || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Cargo Length</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.cargoLength || 'N/A'}
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
              {currentVehicle.engineNumber || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Chassis Number</Label>
            <p className="text-lg font-semibold font-mono">
              {currentVehicle.chassisNumber || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">Vehicle Details</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.vehicleDetails || 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">AC Model</Label>
            <p className="text-lg font-semibold">
              {currentVehicle.acModel || 'N/A'}
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
          onDocumentChange={(documentType, url) => {
            const updatedVehicle = { ...currentVehicle, [`${documentType}Document`]: url };
            setCurrentVehicle(updatedVehicle);
            if (onVehicleUpdate) {
              onVehicleUpdate(updatedVehicle);
            }
          }}
          onDocumentRemove={(documentType) => {
            const updatedVehicle = { ...currentVehicle, [`${documentType}Document`]: '' };
            setCurrentVehicle(updatedVehicle);
            if (onVehicleUpdate) {
              onVehicleUpdate(updatedVehicle);
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
                documentUrl={currentVehicle.pucDocument}
                documentType="PUC"
                label="PUC Document"
              />
            </div>
          )}
          {currentVehicle.insuranceDocument && (
            <div>
              <Label className="text-gray-600">Insurance Document</Label>
              <DocumentPreview
                documentUrl={currentVehicle.insuranceDocument}
                documentType="Insurance"
                label="Insurance Document"
              />
            </div>
          )}
          {currentVehicle.fitnessDocument && (
            <div>
              <Label className="text-gray-600">Fitness Document</Label>
              <DocumentPreview
                documentUrl={currentVehicle.fitnessDocument}
                documentType="Fitness"
                label="Fitness Document"
              />
            </div>
          )}
          {currentVehicle.npDocument && (
            <div>
              <Label className="text-gray-600">NP Document</Label>
              <DocumentPreview
                documentUrl={currentVehicle.npDocument}
                documentType="NP"
                label="NP Document"
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
