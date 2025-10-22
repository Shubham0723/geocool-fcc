'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentSection } from '@/components/DocumentSection';
import { type Vehicle } from '@/lib/types';

interface VehicleFormProps {
  vehicle: Partial<Vehicle>;
  onVehicleChange: (vehicle: Partial<Vehicle>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDocumentChange: (documents: any) => void;
  onDocumentRemove: (documentType: string) => void;
  isLoading?: boolean;
}

export function VehicleForm({
  vehicle,
  onVehicleChange,
  onSubmit,
  onCancel,
  onDocumentChange,
  onDocumentRemove,
  isLoading = false,
}: VehicleFormProps) {
  const handleFieldChange = (field: string, value: any) => {
    onVehicleChange({ ...vehicle, [field]: value });
  };

  return (
    <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
          <Input
            id="vehicleNumber"
            placeholder="e.g., MH01AB1234"
            value={vehicle.vehicleNumber || ''}
            onChange={(e) => handleFieldChange('vehicleNumber', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            placeholder="e.g., Tata 407"
            value={vehicle.model || ''}
            onChange={(e) => handleFieldChange('model', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            placeholder="e.g., Tata, Mahindra, Ashok Leyland"
            value={vehicle.make || ''}
            onChange={(e) => handleFieldChange('make', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type *</Label>
          <Select
            value={vehicle.fuelType || 'diesel'}
            onValueChange={(value) => handleFieldChange('fuelType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Company Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="e.g., Tata Motors"
            value={vehicle.companyName || ''}
            onChange={(e) => handleFieldChange('companyName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            placeholder="e.g., Mumbai"
            value={vehicle.branch || ''}
            onChange={(e) => handleFieldChange('branch', e.target.value)}
          />
        </div>
      </div>

      {/* Dimensions and Capacity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargoLength">Cargo Length</Label>
          <Input
            id="cargoLength"
            placeholder="e.g., 22"
            type="number"
            value={vehicle.cargoLength || ''}
            onChange={(e) => handleFieldChange('cargoLength', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input
            id="seatingCapacity"
            placeholder="e.g., 6490"
            type="number"
            value={vehicle.seatingCapacity || ''}
            onChange={(e) => handleFieldChange('seatingCapacity', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Engine and Chassis */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="engineNumber">Engine Number *</Label>
          <Input
            id="engineNumber"
            placeholder="e.g., ENG123456"
            value={vehicle.engineNumber || ''}
            onChange={(e) => handleFieldChange('engineNumber', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chassisNumber">Chassis Number *</Label>
          <Input
            id="chassisNumber"
            placeholder="e.g., CHS123456"
            value={vehicle.chassisNumber || ''}
            onChange={(e) => handleFieldChange('chassisNumber', e.target.value)}
          />
        </div>
      </div>

      {/* Vehicle Details and AC Model */}
      <div className="space-y-2">
        <Label htmlFor="vehicleDetails">Vehicle Details</Label>
        <Input
          id="vehicleDetails"
          placeholder="e.g., Additional vehicle specifications"
          value={vehicle.vehicleDetails || ''}
          onChange={(e) => handleFieldChange('vehicleDetails', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="acModel">AC Model</Label>
        <Input
          id="acModel"
          placeholder="e.g., Oasis-250"
          value={vehicle.acModel || ''}
          onChange={(e) => handleFieldChange('acModel', e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={vehicle.status || 'active'}
          onValueChange={(value) => handleFieldChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Document Upload Section */}
      {vehicle.vehicleNumber && (
        <DocumentSection
          vehicleNumber={vehicle.vehicleNumber}
          documents={{
            pucDocument: vehicle.pucDocument || '',
            npDocument: vehicle.npDocument || '',
            insuranceDocument: vehicle.insuranceDocument || '',
            fitnessDocument: vehicle.fitnessDocument || '',
          }}
          onDocumentChange={onDocumentChange}
          onDocumentRemove={onDocumentRemove}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Add Vehicle'}
        </Button>
      </div>
    </div>
  );
}
