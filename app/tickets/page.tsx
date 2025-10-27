'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { type Vehicle, type Operation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


type OperationWithVehicle = Operation & {
  vehicles?: Vehicle;
  vehicleNumber?: string;
  totalInvAmountPayable?: number;
  dateSendToWS?: string;
};

export default function OperationsPage() {
  const router = useRouter();
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tickets</h1>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
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
          <CardTitle>Tickets List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOperations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No operations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {/* <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      ID
                    </th> */}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Vehicle Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((operation, index) => (
                    <tr
                      key={operation._id?.toString() || index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        operation._id && router.push(`/operation-details/${operation._id}`)
                      }
                    >
                      {/* <td className="py-3 px-4 font-mono text-sm text-gray-600">
                        #{operation._id?.toString().slice(0, 8) || '-'}
                      </td> */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-red-600">
                            {operation.vehicleNumber || '--'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {operation.operationType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ₹{operation.totalInvAmountPayable?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {operation.description || '--'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {operation.dateSendToWS || '--'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(operation.status)}</td>
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
