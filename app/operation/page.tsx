'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Vehicle, type Operation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const expenseTypes = [
  { label: 'Vehicle Service', value: 'vehicle_service' },
  { label: 'Running Repairs', value: 'running_repairs' },
  { label: 'Running Repair Parts', value: 'running_repair_parts' },
  { label: 'AC Service', value: 'ac_service' },
];

export default function OperationPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const { toast } = useToast();

  const [operationData, setOperationData] = useState({
    operationType: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle && selectedVehicle._id) {
      fetchOperations(selectedVehicle._id.toString());
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (searchTerm && vehicles.length > 0) {
      const filtered = vehicles.filter(vehicle =>
        vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.branch.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles || []);
    }
  }, [searchTerm, vehicles]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      if (response.ok) {
        const activeVehicles = (data || []).filter((vehicle: Vehicle) => vehicle.status === 'active');
        setVehicles(activeVehicles);
        setFilteredVehicles(activeVehicles);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch vehicles',
          variant: 'destructive',
        });
        setVehicles([]);
        setFilteredVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles',
        variant: 'destructive',
      });
      setVehicles([]);
      setFilteredVehicles([]);
    }
  };

  const fetchOperations = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/operations?vehicleId=${vehicleId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOperations(data.slice(0, 10)); // Limit to 10 most recent
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch operations',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch operations',
        variant: 'destructive',
      });
    }
  };

  const calculateGST = (amount: number) => {
    const gstRate = 0.18;
    const withoutGST = amount / (1 + gstRate);
    const gstAmount = amount - withoutGST;
    return {
      withGST: amount,
      withoutGST: withoutGST,
      gstAmount: gstAmount,
    };
  };

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      toast({
        title: 'Error',
        description: 'Please select a vehicle',
        variant: 'destructive',
      });
      return;
    }

    if (!operationData.operationType || !operationData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(operationData.amount);

    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleNumber: selectedVehicle.vehicleNumber,
          operationType: operationData.operationType,
          amount: amount,
          description: operationData.description,
          operationDate: new Date(),
          status: 'pending',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Operation added successfully',
        });
        setOperationData({
          operationType: '',
          amount: '',
          description: '',
        });
        fetchOperations(selectedVehicle._id?.toString() || '');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add operation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add operation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Operation</h1>

      <Card className="border-l-4 border-l-red-600">
        <CardHeader>
          <CardTitle>Search Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-search">Search Vehicle</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="vehicle-search"
                  placeholder="Enter vehicle number, model, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedVehicle(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {searchTerm && filteredVehicles.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id?.toString() || Math.random()}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setSearchTerm(vehicle.vehicleNumber);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-600">{vehicle.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">{vehicle.model} - {vehicle.branch}</p>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4',
                          selectedVehicle?._id === vehicle._id
                            ? 'opacity-100 text-red-600'
                            : 'opacity-0'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && filteredVehicles.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No vehicles found matching "{searchTerm}"
              </div>
            )}

            {selectedVehicle && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">
                  Selected Vehicle Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Number:</span>
                    <p className="font-medium">{selectedVehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Model:</span>
                    <p className="font-medium">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <p className="font-medium">{selectedVehicle.branch}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedVehicle && (
        <>
          <Card className="border-l-4 border-l-red-600">
            <CardHeader>
              <CardTitle>Add Operation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operationType">Type of Operation</Label>
                  <Select
                    value={operationData.operationType}
                    onValueChange={(value) =>
                      setOperationData({ ...operationData, operationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={operationData.amount}
                    onChange={(e) =>
                      setOperationData({
                        ...operationData,
                        amount: e.target.value,
                      })
                    }
                  />
                  {operationData.amount && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p>
                        Amount: ₹{parseFloat(operationData.amount).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter operation details..."
                    value={operationData.description}
                    onChange={(e) =>
                      setOperationData({
                        ...operationData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Submit Operation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Operations</CardTitle>
            </CardHeader>
            <CardContent>
              {operations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No operations recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Expense Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Total Cost
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {operations.map((operation) => (
                        <tr
                          key={operation._id?.toString() || `operation-${Math.random()}`}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {format(new Date(operation.operationDate), 'PP')}
                          </td>
                          <td className="py-3 px-4">{operation.operationType}</td>
                          <td className="py-3 px-4 font-semibold text-red-600">
                            ₹{operation.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {operation.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
