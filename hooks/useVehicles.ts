'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Vehicle } from '@/lib/types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      if (response.ok) {
        setVehicles(data);
        setFilteredVehicles(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch vehicles',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new vehicle
  const addVehicle = async (vehicleData: Partial<Vehicle>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vehicle added successfully',
        });
        await fetchVehicles(); // Refresh the list
        return true;
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to add vehicle',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add vehicle',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update vehicle
  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => 
      prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v)
    );
    setFilteredVehicles(prev => 
      prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v)
    );
  };

  // Filter vehicles based on search term
  useEffect(() => {
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.make && vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.companyName && vehicle.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.engineNumber && vehicle.engineNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.chassisNumber && vehicle.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.acModel && vehicle.acModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.vehicleDetails && vehicle.vehicleDetails.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // Load vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    filteredVehicles,
    searchTerm,
    setSearchTerm,
    isLoading,
    fetchVehicles,
    addVehicle,
    updateVehicle,
  };
}
