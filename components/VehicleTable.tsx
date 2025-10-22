'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { type Vehicle } from '@/lib/types';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onViewVehicle: (vehicle: Vehicle) => void;
}

export function VehicleTable({ vehicles, onViewVehicle }: VehicleTableProps) {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vehicle List</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Vehicle Number
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  Model
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  Make
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[150px]">
                  Company Name
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  Branch
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                  Status
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                  Year
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                  Color
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                  Fuel Type
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  Seating Capacity
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  Cargo Length
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Engine Number
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Chassis Number
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Vehicle Details
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                  AC Model
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Registration Date
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Insurance Expiry
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  Fitness Expiry
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                  PUC Expiry
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={20}
                    className="text-center py-8 text-gray-500"
                  >
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr
                    key={vehicle._id?.toString() || Math.random()}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onViewVehicle(vehicle)}
                  >
                    <td className="py-3 px-2 text-red-600 font-medium">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="py-3 px-2">{vehicle.model}</td>
                    <td className="py-3 px-2">{vehicle.make || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.companyName || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.branch}</td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{vehicle.year || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.color || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.fuelType || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.seatingCapacity || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.cargoLength || 'N/A'}</td>
                    <td className="py-3 px-2 text-xs">{vehicle.engineNumber || 'N/A'}</td>
                    <td className="py-3 px-2 text-xs">{vehicle.chassisNumber || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.vehicleDetails || 'N/A'}</td>
                    <td className="py-3 px-2">{vehicle.acModel || 'N/A'}</td>
                    <td className="py-3 px-2 text-xs">
                      {vehicle.registrationDate 
                        ? new Date(vehicle.registrationDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-2 text-xs">
                      {vehicle.insuranceExpiry 
                        ? new Date(vehicle.insuranceExpiry).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-2 text-xs">
                      {vehicle.fitnessExpiry 
                        ? new Date(vehicle.fitnessExpiry).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-2 text-xs">
                      {vehicle.pucExpiry 
                        ? new Date(vehicle.pucExpiry).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewVehicle(vehicle);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
