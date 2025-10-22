'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { type Vehicle, type Operation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


type OperationWithVehicle = Operation & {
  vehicles?: Vehicle;
};

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOperations();
    fetchVehicles();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/operations');
      const data = await response.json();
      
      if (response.ok) {
        setOperations(data);
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

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      if (response.ok) {
        const activeVehicles = data.filter((vehicle: Vehicle) => vehicle.status === 'active');
        setVehicles(activeVehicles);
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
    }
  };


  const handleUpdateStatus = async (operationId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };

    try {
      const response = await fetch(`/api/operations/${operationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Operation status updated',
        });
        fetchOperations();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update operation status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update operation status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredOperations = operations.filter(
    (operation) => selectedStatus === 'all' || operation.status === selectedStatus
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
      </div>

      <div className="flex gap-4">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('all')}
          className={selectedStatus === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          All
        </Button>
        <Button
          variant={selectedStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('pending')}
          className={selectedStatus === 'pending' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Pending
        </Button>
        <Button
          variant={selectedStatus === 'approved' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('approved')}
          className={
            selectedStatus === 'approved' ? 'bg-red-600 hover:bg-red-700' : ''
          }
        >
          Approved
        </Button>
        <Button
          variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('rejected')}
          className={selectedStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Rejected
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operations List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOperations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No operations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Operation ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Vehicle ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Operation Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount (₹)
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Operation Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((operation, index) => (
                    <tr
                      key={operation._id?.toString() || index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm text-gray-600">
                        #{operation._id?.toString().slice(0, 8) || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-red-600">
                            {operation.vehicleId?.toString() || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {operation.operationType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ₹{operation.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {operation.description || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {operation.operationDate 
                          ? format(new Date(operation.operationDate), 'PP')
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(operation.status)}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={operation.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(operation._id?.toString() || '', value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
