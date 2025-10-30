'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [operationTypes, setOperationTypes] = useState<{ _id: string, Type_name: string }[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loadMoreSentinelRef = (useState<HTMLDivElement | null>(null))[0];
  const { toast } = useToast();

  const fetchOperations = useCallback(async () => {
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
  }, [toast]);

  const fetchVehicles = useCallback(async () => {
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
  }, [toast]);

  const fetchOperationTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/maintenance_type');
      const data = await response.json();
      setOperationTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching operation types:', error);
      setOperationTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
    fetchVehicles();
    fetchOperationTypes();
  }, [fetchOperations, fetchVehicles, fetchOperationTypes]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [selectedStatus, selectedType]);

  // Intersection Observer to auto-increase visibleCount when bottom sentinel enters view
  useEffect(() => {
    const sentinel = document.getElementById('tickets-load-more-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsLoadingMore(true);
        // Small timeout to avoid rapid increments
        setTimeout(() => {
          setVisibleCount((prev) => prev + 15);
          setIsLoadingMore(false);
        }, 150);
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [operations, selectedStatus, selectedType]);

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
    (operation) => {
      const statusMatch = selectedStatus === 'all' || operation.status === selectedStatus;
      const typeMatch = selectedType === 'all' || operation.operationType === selectedType;
      return statusMatch && typeMatch;
    }
  );

  const visibleOperations = filteredOperations.slice(0, visibleCount);

  // CSV export (opens in Excel) for currently displayed rows
  const csvEscape = (value: unknown) => {
    const str = value === undefined || value === null ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Prefix with a tab so Excel treats it as text and doesn't render #####
  const asExcelText = (value: string) => (value ? `\t${value}` : '');

  const handleDownloadCsv = () => {
    const headers = ['Vehicle Number', 'Type', 'Amount', 'Description', 'Date', 'Status'];
    const rows = filteredOperations.map(op => [
      op.vehicleNumber || '--',
      op.operationType,
      op.totalInvAmountPayable ?? 0,
      op.description || '',
      // Force Excel to read as text to avoid #####
      asExcelText(op.dateSendToWS || ''),
      op.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(csvEscape).join(','))
      .join('\n');

    // Prepend BOM to ensure Excel reads UTF-8 correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.download = `tickets-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center justify-between">
            <CardTitle>Tickets List</CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleDownloadCsv}>Download CSV</Button>
              <span className="text-sm text-gray-600">Filter by Type:</span>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {operationTypes.map(type => (
                    <SelectItem key={type._id} value={type.Type_name}>
                      {type.Type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  {visibleOperations.map((operation, index) => (
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
                  {/* Loading indicator row */}
                  {isLoadingMore && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">Loading more…</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Sentinel for intersection observer */}
              <div id="tickets-load-more-sentinel" className="h-8" />
              {/* Fallback manual load more */}
              {visibleCount < filteredOperations.length && (
                <div className="flex justify-center py-4">
                  <Button variant="outline" onClick={() => setVisibleCount((v) => v + 15)}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
