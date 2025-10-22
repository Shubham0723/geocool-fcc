'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { type Vehicle } from '@/lib/types';
import { useVehicles } from '@/hooks/useVehicles';
import { VehicleTable } from '@/components/VehicleTable';
import { VehicleSearch } from '@/components/VehicleSearch';
import { VehicleForm } from '@/components/VehicleForm';
import { VehicleDetails } from '@/components/VehicleDetails';

export default function MasterDataPage() {
  const {
    vehicles,
    filteredVehicles,
    searchTerm,
    setSearchTerm,
    isLoading,
    addVehicle,
    updateVehicle,
  } = useVehicles();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    vehicleNumber: '',
    model: '',
    make: '',
    companyName: '',
    branch: '',
    status: 'active',
    year: new Date().getFullYear(),
    color: 'White',
    fuelType: 'diesel',
    seatingCapacity: 0,
    cargoLength: 0,
    engineNumber: '',
    chassisNumber: '',
    vehicleDetails: '',
    acModel: '',
    registrationDate: new Date(),
    insuranceExpiry: new Date(),
    fitnessExpiry: new Date(),
    pucExpiry: new Date(),
    pucDocument: '',
    npDocument: '',
    insuranceDocument: '',
    fitnessDocument: '',
    // New fields with dummy data
    insurance: new Date('2025-07-04'),
    roadtax: new Date('2025-07-31'),
    puc: new Date('2025-08-20'),
    fitness: new Date('2026-08-20'),
    goodsPermit: new Date('2029-08-22'),
    nationalPermit: new Date('2025-08-22'),
    rc: 'RC In Office',
    remark: '',
  });

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  const handleAddVehicle = async () => {
    const success = await addVehicle(newVehicle);
    if (success) {
        setIsAddDialogOpen(false);
        setNewVehicle({
          vehicleNumber: '',
          model: '',
          make: '',
          companyName: '',
          branch: '',
          status: 'active',
          year: new Date().getFullYear(),
          color: 'White',
          fuelType: 'diesel',
          seatingCapacity: 0,
          cargoLength: 0,
          engineNumber: '',
          chassisNumber: '',
          vehicleDetails: '',
          acModel: '',
          registrationDate: new Date(),
          insuranceExpiry: new Date(),
          fitnessExpiry: new Date(),
          pucExpiry: new Date(),
          pucDocument: '',
          npDocument: '',
          insuranceDocument: '',
          fitnessDocument: '',
          // New fields with dummy data
          insurance: new Date('2025-07-04'),
          roadtax: new Date('2025-07-31'),
          puc: new Date('2025-08-20'),
          fitness: new Date('2026-08-20'),
          goodsPermit: new Date('2029-08-22'),
          nationalPermit: new Date('2025-08-22'),
          rc: 'RC In Office',
          remark: '',
        });
    }
  };

  const handleDocumentChange = (documents: any) => {
    setNewVehicle(prev => ({ ...prev, ...documents }));
  };

  const handleDocumentRemove = (documentType: string) => {
    setNewVehicle(prev => ({ ...prev, [documentType]: '' }));
  };

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    updateVehicle(updatedVehicle);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Master Data</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <VehicleForm
              vehicle={newVehicle}
              onVehicleChange={setNewVehicle}
              onSubmit={handleAddVehicle}
              onCancel={() => setIsAddDialogOpen(false)}
                  onDocumentChange={handleDocumentChange}
                  onDocumentRemove={handleDocumentRemove}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex justify-end">
          <VehicleSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
              />
            </div>
        
        <VehicleTable
          vehicles={filteredVehicles}
          onViewVehicle={handleViewVehicle}
        />
          </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <VehicleDetails 
              vehicle={selectedVehicle} 
              onVehicleUpdate={handleVehicleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}