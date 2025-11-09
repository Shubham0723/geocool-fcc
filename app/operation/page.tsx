'use client';

import React, { useEffect, useState } from 'react';
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
import { DocumentPreview } from '@/components/DocumentPreview';

export default function OperationPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const { toast } = useToast();

  const [formType, setFormType] = useState<'ac-maintenance' | 'vehicle-maintenance' | ''>('');
  const [operationData, setOperationData] = useState({
    operationType: '',
    subPartName: '',
    amount: '',
    description: '',
    // AC Maintenance specific fields
    acUnit: '',
    dateSendToWS: '',
    engineHrs: '',
    workshop: '',
    advisorNo: '',
    complaints: '',
    actionTaken: '',
    vehReadyDateFromWS: '',
    invoiceNo: '',
    invoiceDate: '',
    // Vehicle Maintenance specific fields
    serviceKM: '',
    workOrderNo: '',
    // Common new fields for both forms
    spare: '',
    spareWithoutTax: '',
    labour: '',
    outsideLabour: '',
    discountOnParts: '',
    gstOnParts: '',
    gstOnPartsCustom1: '', // new
    gstOnPartsCustom2: '', // new
    discountLabour: '',
    gstOnLabour: '',
    gstOnLabourCustom1: '', // new
    gstOnLabourCustom2: '', // new
    totalInvAmountPayable: '',
    totalAmountWithDiscountButWithoutTax: '',
    remark: '',
    jobType: '',
    spareWith18GST: '', // new
    spareWith28GST: '', // new
    spareWith5GST: '',
    amcNonAmc: '', // AMC/Non AMC dropdown
  });
  // New state for dynamic types
  const [operationTypes, setOperationTypes] = useState<{ _id: string, Type_name: string }[]>([]);
  const [typeInput, setTypeInput] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrlPreview, setFileUrlPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchOperationTypes();
  }, []);

  // Helper to generate auto number in required format: PREFIX-dd/mm/yyyy-M
  const generateAutoNumber = (prefix: 'SM' | 'AC') => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    return `${prefix}-${dd}/${mm}/${yyyy}-M`;
  };

  // Auto fill Work Order No. / Advisor No. based on selected form type
  useEffect(() => {
    if (formType === 'vehicle-maintenance') {
      setOperationData((d) => ({ ...d, workOrderNo: generateAutoNumber('SM') }));
    } else if (formType === 'ac-maintenance') {
      setOperationData((d) => ({ ...d, advisorNo: generateAutoNumber('AC') }));
    }
  }, [formType]);

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
        // Show all vehicles, not just active ones
        setVehicles(data || []);
        setFilteredVehicles(data || []);
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

  const fetchOperationTypes = async () => {
    try {
      const res = await fetch('/api/maintenance_type');
      const data = await res.json();
      setOperationTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setOperationTypes([]);
    }
  };

  const handleAddOperationType = async () => {
    if (!typeInput) return;
    setAddingType(true);
    try {
      const res = await fetch('/api/maintenance_type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Type_name: typeInput }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTypeInput('');
        toast({ title: 'Success', description: 'Type Added' });
        await fetchOperationTypes();
        setOperationData(d => ({ ...d, operationType: result.Type_name }));
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to add type', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add type', variant: 'destructive' });
    }
    setAddingType(false);
  };

  /*const calculateGST = (amount: number) => {
    const gstRate = 0.18;
    const withoutGST = amount / (1 + gstRate);
    const gstAmount = amount - withoutGST;
    return {
      withGST: amount,
      withoutGST: withoutGST,
      gstAmount: gstAmount,
    };
  };*/

  const calculateTotalAmounts = () => {
    const spareWithoutTax = parseFloat(operationData.spareWithoutTax) || 0;
    const discountOnParts = parseFloat(operationData.discountOnParts) || 0;
    const gstOnParts = operationData.gstOnParts === '18%' ? 0.18 : operationData.gstOnParts === '28%' ? 0.28 : operationData.gstOnParts === '5%' ? 0.05 : 0;

    const spareDiscountAmount = spareWithoutTax * (discountOnParts / 100);
    const spareAfterDiscount = spareWithoutTax - spareDiscountAmount;
    const spareGSTAmount = spareAfterDiscount * gstOnParts;
    const spareWithGST = spareAfterDiscount + spareGSTAmount;

    const spare5Value = parseFloat(operationData.spareWith5GST) || 0;
    const spare18Value = parseFloat(operationData.spareWith18GST) || 0;
    const spare28Value = parseFloat(operationData.spareWith28GST) || 0;
    // LABOUR GST LOGIC:
    const discountLabour = parseFloat(operationData.discountLabour) || 0;
    const gstOnLabour = operationData.gstOnLabour === '18%' ? 0.18 : operationData.gstOnLabour === '28%' ? 0.28 : operationData.gstOnLabour === '5%' ? 0.05 : 0;
    const labour = parseFloat(operationData.labour) || 0;
    const labourAfterDiscount = labour - (labour * (discountLabour / 100));
    const labourGSTAmount = labourAfterDiscount * gstOnLabour;
    const labourWithGST = labourAfterDiscount + labourGSTAmount;

    const spare5AfterDiscount = spare5Value - (spare5Value * (discountOnParts / 100));
    const spare18AfterDiscount = spare18Value - (spare18Value * (discountOnParts / 100));
    const spare28AfterDiscount = spare28Value - (spare28Value * (discountOnParts / 100));
    const spare5WithGST = spare5AfterDiscount * 1.05;
    const spare18WithGST = spare18AfterDiscount * 1.18;
    const spare28WithGST = spare28AfterDiscount * 1.28;

    // Define outsideLabour as a number (not defined before)
    const outsideLabour = parseFloat(operationData.outsideLabour) || 0;
    const outsideLabourDiscountAmount = outsideLabour * (discountLabour / 100);
    const outsideLabourAfterDiscount = outsideLabour - outsideLabourDiscountAmount;
    const outsideLabourGSTAmount = outsideLabourAfterDiscount * gstOnLabour;
    const outsideLabourWithGST = outsideLabourAfterDiscount + outsideLabourGSTAmount;

    const totalInvAmountPayable =
      spareWithGST +
      spare5WithGST +
      spare18WithGST +
      spare28WithGST +
      labourWithGST +
      outsideLabourWithGST;

    const totalAmountWithDiscountButWithoutTax =
      spareAfterDiscount +
      spare5AfterDiscount +
      spare18AfterDiscount +
      spare28AfterDiscount +
      labourAfterDiscount +
      outsideLabourAfterDiscount;

    return {
      spareDiscountAmount: spareDiscountAmount.toFixed(2),
      spareAfterDiscount: spareAfterDiscount.toFixed(2),
      spareGSTAmount: spareGSTAmount.toFixed(2),
      spareWithGST: spareWithGST.toFixed(2),
      spare5AfterDiscount: spare5AfterDiscount.toFixed(2),
      spare18AfterDiscount: spare18AfterDiscount.toFixed(2),
      spare28AfterDiscount: spare28AfterDiscount.toFixed(2),
      spare5WithGST: spare5WithGST.toFixed(2),
      spare18WithGST: spare18WithGST.toFixed(2),
      spare28WithGST: spare28WithGST.toFixed(2),
      labourAfterDiscount: labourAfterDiscount.toFixed(2),
      labourGSTAmount: labourGSTAmount.toFixed(2),
      labourWithGST: labourWithGST.toFixed(2),
      outsideLabourDiscountAmount: outsideLabourDiscountAmount.toFixed(2),
      outsideLabourAfterDiscount: outsideLabourAfterDiscount.toFixed(2),
      outsideLabourGSTAmount: outsideLabourGSTAmount.toFixed(2),
      outsideLabourWithGST: outsideLabourWithGST.toFixed(2),
      totalInvAmountPayable: totalInvAmountPayable.toFixed(2),
      totalAmountWithDiscountButWithoutTax: totalAmountWithDiscountButWithoutTax.toFixed(2),
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

    if (!formType) {
      toast({
        title: 'Error',
        description: 'Please select a form type',
        variant: 'destructive',
      });
      return;
    }

    // if (!operationData.operationType || !operationData.amount) {
    //   toast({
    //     title: 'Error',
    //     description: 'Please fill in all required fields',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    const amount = parseFloat(operationData.amount);
    let invoiceBillUrl = '';
    if (file && selectedVehicle.vehicleNumber) {
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('documentType', 'invoiceBill');
      fileData.append('vehicleNumber', selectedVehicle.vehicleNumber);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fileData });
      const uploadJson = await uploadRes.json();
      if (uploadJson && uploadJson.url) invoiceBillUrl = uploadJson.url;
    }

    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleNumber: selectedVehicle.vehicleNumber,
          operationType: operationData.operationType,
          subPartName: operationData.subPartName,
          amount,
          description: operationData.description,
          operationDate: new Date(),
          status: 'pending',
          invoiceBill: invoiceBillUrl || undefined,
          formType: formType,
          // All fields from the form
          dateSendToWS: operationData.dateSendToWS,
          workshop: operationData.workshop,
          complaints: operationData.complaints,
          actionTaken: operationData.actionTaken,
          vehReadyDateFromWS: operationData.vehReadyDateFromWS,
          invoiceNo: operationData.invoiceNo,
          invoiceDate: operationData.invoiceDate,
          // AC Maintenance fields
          acUnit: operationData.acUnit,
          engineHrs: operationData.engineHrs,
          advisorNo: operationData.advisorNo,
          // Vehicle Maintenance fields
          serviceKM: operationData.serviceKM,
          workOrderNo: operationData.workOrderNo,
          // Financial fields
          spare: operationData.spare,
          spareWithoutTax: operationData.spareWithoutTax,
          labour: operationData.labour,
          outsideLabour: operationData.outsideLabour,
          discountOnParts: operationData.discountOnParts,
          gstOnParts: operationData.gstOnParts,
          discountLabour: operationData.discountLabour,
          gstOnLabour: operationData.gstOnLabour,
          spareWith5GST:operationData.spareWith5GST,
          spareWith18GST: operationData.spareWith18GST,
          spareWith28GST: operationData.spareWith28GST,
          // Additional fields
          remark: operationData.remark,
          jobType: operationData.jobType,
          amcNonAmc: operationData.amcNonAmc,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Operation added successfully',
        });
        setOperationData({
          operationType: '',
          subPartName: '',
          amount: '',
          description: '',
          acUnit: '',
          dateSendToWS: '',
          engineHrs: '',
          workshop: '',
          advisorNo: '',
          complaints: '',
          actionTaken: '',
          vehReadyDateFromWS: '',
          invoiceNo: '',
          invoiceDate: '',
          serviceKM: '',
          workOrderNo: '',
          spare: '',
          spareWithoutTax: '',
          labour: '',
          outsideLabour: '',
          discountOnParts: '',
          gstOnParts: '',
          gstOnPartsCustom1: '', // new
          gstOnPartsCustom2: '', // new
          discountLabour: '',
          gstOnLabour: '',
          gstOnLabourCustom1: '', // new
          gstOnLabourCustom2: '', // new
          totalInvAmountPayable: '',
          totalAmountWithDiscountButWithoutTax: '',
          remark: '',
          jobType: '',
          spareWith18GST: '', // new for reset
          spareWith28GST: '', // new for reset
          spareWith5GST: '',
          amcNonAmc: '', // reset AMC/Non AMC
        });
        setFile(null); setFileUrlPreview(null);
        setFormType('');
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
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/operations`);
                        const data = await res.json();
                        // Find operations for this vehicle with status not completed
                        const blocked = Array.isArray(data) && data.some((op) => op.vehicleNumber === vehicle.vehicleNumber && op.status !== 'completed');
                        if (blocked) {
                          toast({ title: 'Info', description: 'This vehicle is still not completed.' });
                        } else {
                          setSelectedVehicle(vehicle);
                          setSearchTerm(vehicle.vehicleNumber);
                        }
                      } catch (e) {
                        toast({ title: 'Error', description: 'Failed to check operation status.' });
                      }
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
                No vehicles found matching {searchTerm}
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
                  {/* New fields */}
                  <div>
                    <span className="text-gray-600">Chassis No:</span>
                    <p className="font-medium">{selectedVehicle.chassisNumber || '--'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Make:</span>
                    <p className="font-medium">{selectedVehicle.make || '--'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company Name:</span>
                    <p className="font-medium">{selectedVehicle.companyName || '--'}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-gray-600">Vehicle Details:</span>
                    <p className="font-medium">{selectedVehicle.vehicleDetails || '--'}</p>
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
              <div className="space-y-3">
                {/* Form Type Selection */}
                <div className="space-y-1">
                  <Label htmlFor="formType" className="text-sm">Select Form Type</Label>
                  <Select
                    value={formType}
                    onValueChange={(value: 'ac-maintenance' | 'vehicle-maintenance') => setFormType(value)}
                  >
                    <SelectTrigger className="h-9 w-80">
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac-maintenance">AC Maintenance</SelectItem>
                      <SelectItem value="vehicle-maintenance">Vehicle Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show form only when form type is selected */}
                {formType && (
                  <div className="space-y-8">
                    {/* Type of Operation */}
                    <div className="space-y-3">
                      <Label htmlFor="operationType" className="text-sm font-medium">Type of Operation</Label>
                      <div className="space-y-3">
                        <Select
                          value={operationData.operationType}
                          onValueChange={value => setOperationData({ ...operationData, operationType: value })}
                        >
                          <SelectTrigger className="h-10 w-80">
                            <SelectValue placeholder="Select operation type" />
                          </SelectTrigger>
                          <SelectContent>
                            {operationTypes.map(type => (
                              <SelectItem key={type._id} value={type.Type_name}>
                                {type.Type_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-4">
                          <Input
                            value={typeInput}
                            onChange={e => setTypeInput(e.target.value)}
                            placeholder="Add new type..."
                            className="h-10 w-64"
                            onKeyDown={e => { if (e.key === 'Enter') handleAddOperationType(); }}
                            disabled={addingType}
                          />
                          <Button
                            onClick={handleAddOperationType}
                            disabled={addingType || !typeInput}
                            className="bg-gray-200 text-sm text-gray-800 hover:bg-gray-300 h-10 px-4"
                            type="button"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Sub Part Name */}
                    <div className="space-y-3">
                      <Label htmlFor="subPartName" className="text-sm font-medium">Sub Part Name</Label>
                      <Select
                        value={operationData.subPartName}
                        onValueChange={(value) => setOperationData({ ...operationData, subPartName: value })}
                      >
                        <SelectTrigger id="subPartName" className="h-10 w-80">
                          <SelectValue placeholder="Select sub part name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC Service">AC Service</SelectItem>
                          <SelectItem value="Engine">Engine</SelectItem>
                          <SelectItem value="Tyre">Tyre</SelectItem>
                          <SelectItem value="Battery">Battery</SelectItem>
                          <SelectItem value="Labour">Labour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* AC Maintenance Specific Fields */}
                    {formType === 'ac-maintenance' && (
                      <>
                        {/* AC Unit and Advisor No */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="acUnit" className="text-sm font-medium">AC Unit</Label>
                            <Select
                              value={operationData.acUnit}
                              onValueChange={(val) => setOperationData({ ...operationData, acUnit: val })}
                            >
                              <SelectTrigger id="acUnit" className="h-10 w-80">
                                <SelectValue placeholder="Select AC unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Oasis-250">Oasis-250</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="advisorNo" className="text-sm font-medium">Advisor No</Label>
                            <Input
                              id="advisorNo"
                              placeholder="Advisor number"
                              value={operationData.advisorNo}
                              readOnly
                              className="h-10 w-64 bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* AMC/Non AMC */}
                        <div className="space-y-3">
                          <Label htmlFor="amcNonAmc" className="text-sm font-medium">AMC/Non AMC</Label>
                          <Select
                            value={operationData.amcNonAmc}
                            onValueChange={(val) => setOperationData({ ...operationData, amcNonAmc: val })}
                          >
                            <SelectTrigger id="amcNonAmc" className="h-10 w-80">
                              <SelectValue placeholder="Select AMC/Non AMC" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AMC">AMC</SelectItem>
                              <SelectItem value="Non AMC">Non AMC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Send to W/S and Veh Ready Date from W/S */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="dateSendToWS" className="text-sm font-medium">Date Send to W/S</Label>
                            <Input
                              id="dateSendToWS"
                              type="date"
                              value={operationData.dateSendToWS}
                              onChange={(e) => setOperationData({ ...operationData, dateSendToWS: e.target.value })}
                              className="h-10 w-64"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="vehReadyDateFromWS" className="text-sm font-medium">Veh Ready Date from W/S</Label>
                            <Input
                              id="vehReadyDateFromWS"
                              type="date"
                              value={operationData.vehReadyDateFromWS}
                              onChange={e => setOperationData({ ...operationData, vehReadyDateFromWS: e.target.value })}
                              className="h-10 w-64"
                            />
                          </div>
                        </div>

                        {/* Workshop and Job Type */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="workshop" className="text-sm font-medium">Workshop</Label>
                            <Input
                              id="workshop"
                              placeholder="Enter workshop name"
                              value={operationData.workshop}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  workshop: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="jobType" className="text-sm font-medium">Job Type</Label>
                            <Select
                              value={operationData.jobType}
                              onValueChange={(value) =>
                                setOperationData({
                                  ...operationData,
                                  jobType: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-10 w-64">
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Warranty Job">Warranty Job</SelectItem>
                                <SelectItem value="Paid Service">Paid Service</SelectItem>
                                <SelectItem value="Paid Job">Paid Job</SelectItem>
                                <SelectItem value="FOC">FOC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Complaints and Action Taken */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="complaints" className="text-sm font-medium">Complaint</Label>
                            <Textarea
                              id="complaints"
                              placeholder="Enter complaints details"
                              value={operationData.complaints}
                              onChange={e => setOperationData({ ...operationData, complaints: e.target.value })}
                              rows={3}
                              className="resize-none w-96"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="actionTaken" className="text-sm font-medium">Action Taken</Label>
                            <Textarea
                              id="actionTaken"
                              placeholder="Enter action taken details"
                              value={operationData.actionTaken}
                              onChange={e => setOperationData({ ...operationData, actionTaken: e.target.value })}
                              rows={3}
                              className="resize-none w-96"
                            />
                          </div>
                        </div>

                        {/* Invoice Date and Invoice No */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</Label>
                            <Input
                              id="invoiceDate"
                              type="date"
                              value={operationData.invoiceDate}
                              onChange={e => setOperationData({ ...operationData, invoiceDate: e.target.value })}
                              className="h-10 w-64"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="invoiceNo" className="text-sm font-medium">Invoice No.</Label>
                            <Input
                              id="invoiceNo"
                              type="number"
                              placeholder="Enter invoice number"
                              value={operationData.invoiceNo}
                              onChange={e => setOperationData({ ...operationData, invoiceNo: e.target.value })}
                              className="h-10 w-64"
                            />
                          </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="border-t pt-8 mt-8">
                          <h4 className="text-xl font-semibold mb-8">Additional Details</h4>

                          {/* Spare and Spare Without Tax */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="spareWithoutTax" className="text-sm font-medium">Spare Without Tax</Label>
                              <Input
                                id="spareWithoutTax"
                                type="number"
                                placeholder="Enter spare without tax amount"
                                value={operationData.spareWithoutTax}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    spareWithoutTax: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Spare with 18% GST and 28% GST */}
                          <div className="flex gap-8 mb-8">
                            <div className='space-y-3'>
                              <Label htmlFor="spareWith5GST" className="text-sm font-medium">Spare with 5% GST</Label>
                              <Input
                                id="spareWith5GST"
                                type="number"
                                placeholder="Enter Spare with 5% GST"
                                value={operationData.spareWith5GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith5GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="spareWith18GST" className="text-sm font-medium">Spare with 18% GST</Label>
                              <Input
                                id="spareWith18GST"
                                type="number"
                                placeholder="Enter Spare with 18% GST"
                                value={operationData.spareWith18GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith18GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="spareWith28GST" className="text-sm font-medium">Spare with 28% GST</Label>
                              <Input
                                id="spareWith28GST"
                                type="number"
                                placeholder="Enter Spare with 28% GST"
                                value={operationData.spareWith28GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith28GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Labour and Outside Labour */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="labour" className="text-sm font-medium">Labour</Label>
                              <Input
                                id="labour"
                                type="number"
                                placeholder="Enter labour amount"
                                value={operationData.labour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    labour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="outsideLabour" className="text-sm font-medium">Outside Labour</Label>
                              <Input
                                id="outsideLabour"
                                type="number"
                                placeholder="Enter outside labour amount"
                                value={operationData.outsideLabour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    outsideLabour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Discount on Parts and GST on Parts */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="discountOnParts" className="text-sm font-medium">Discount on Parts</Label>
                              <Select
                                value={operationData.discountOnParts}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    discountOnParts: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select discount percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="gstOnParts" className="text-sm font-medium">GST on Parts</Label>
                              <Select
                                value={operationData.gstOnParts}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    gstOnParts: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select GST percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              {operationData.gstOnParts && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    type="number"
                                    placeholder="Custom % 1"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnPartsCustom1}
                                    onChange={e => setOperationData({ ...operationData, gstOnPartsCustom1: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Custom % 2"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnPartsCustom2}
                                    onChange={e => setOperationData({ ...operationData, gstOnPartsCustom2: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Discount Labour and GST on Labour */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="discountLabour" className="text-sm font-medium">Discount Labour (%)</Label>
                              <Input
                                id="discountLabour"
                                type="number"
                                placeholder="Enter discount labour percentage"
                                value={operationData.discountLabour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    discountLabour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="gstOnLabour" className="text-sm font-medium">GST on Labour</Label>
                              <Select
                                value={operationData.gstOnLabour}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    gstOnLabour: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select GST percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5%">5%</SelectItem>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              {operationData.gstOnLabour && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    type="number"
                                    placeholder="Custom % 1"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnLabourCustom1}
                                    onChange={e => setOperationData({ ...operationData, gstOnLabourCustom1: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Custom % 2"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnLabourCustom2}
                                    onChange={e => setOperationData({ ...operationData, gstOnLabourCustom2: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* GST Amounts Display 
                          {(operationData.spareWithoutTax || operationData.labour || operationData.outsideLabour) && (
                            <div className="bg-blue-50 p-4 rounded-lg border">
                              <h5 className="text-lg font-semibold mb-3 text-blue-800">GST Calculations</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {parseFloat(operationData.spareWith18GST) > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-blue-700">Spare 18% After Discount</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().spare18AfterDiscount}</div>
                                    <div className="text-sm text-blue-600">Spare 18% With GST: ₹{calculateTotalAmounts().spare18WithGST}</div>
                                  </div>
                                )}

                                {parseFloat(operationData.spareWith28GST) > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-blue-700">Spare 28% After Discount</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().spare28AfterDiscount}</div>
                                    <div className="text-sm text-blue-600">Spare 28% With GST: ₹{calculateTotalAmounts().spare28WithGST}</div>
                                  </div>
                                )}

                                {parseFloat(operationData.labour) > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-blue-700">Labour After Discount</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().labourAfterDiscount}</div>
                                  </div>
                                )}

                                {parseFloat(operationData.outsideLabour) > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-blue-700">Outside Labour After Discount</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().outsideLabourAfterDiscount}</div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium text-blue-700">Total Inv Amount Payable</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().totalInvAmountPayable}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium text-blue-700">Total Amount with Discount but Without Tax</Label>
                                    <div className="text-lg font-semibold text-blue-900">₹{calculateTotalAmounts().totalAmountWithDiscountButWithoutTax}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                           */}
                          {/* Total Amount Fields */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="totalInvAmountPayable" className="text-sm font-medium">Total Inv Amount Payable</Label>
                              <Input
                                id="totalInvAmountPayable"
                                type="text"
                                placeholder="Calculated total"
                                value={calculateTotalAmounts().totalInvAmountPayable}
                                readOnly
                                className="bg-gray-50 h-10 w-64"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="totalAmountWithDiscountButWithoutTax" className="text-sm font-medium">Total Amount with Discount but Without Tax</Label>
                              <Input
                                id="totalAmountWithDiscountButWithoutTax"
                                type="text"
                                placeholder="Calculated total"
                                value={calculateTotalAmounts().totalAmountWithDiscountButWithoutTax}
                                readOnly
                                className="bg-gray-50 h-10 w-64"
                              />
                            </div>
                          </div>

                          {/* Remark and Description */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="remark" className="text-sm font-medium">Remark</Label>
                              <Textarea
                                id="remark"
                                placeholder="Enter remarks"
                                value={operationData.remark}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    remark: e.target.value,
                                  })
                                }
                                rows={3}
                                className="resize-none w-96"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
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
                                className="resize-none w-96"
                              />
                            </div>
                          </div>

                        </div>
                      </>
                    )}

                    {/* Vehicle Maintenance Specific Fields */}
                    {formType === 'vehicle-maintenance' && (
                      <>
                        {/* Date Send to W/S and Service KM */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="dateSendToWS" className="text-sm font-medium">Date Send to W/S</Label>
                            <Input
                              id="dateSendToWS"
                              type="date"
                              value={operationData.dateSendToWS}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  dateSendToWS: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="serviceKM" className="text-sm font-medium">Service KM</Label>
                            <Input
                              id="serviceKM"
                              type="number"
                              placeholder="Enter service KM"
                              value={operationData.serviceKM}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  serviceKM: e.target.value,
                                })
                              }
                              className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                        </div>

                        {/* Workshop and Job Type */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="workshop" className="text-sm font-medium">Workshop</Label>
                            <Input
                              id="workshop"
                              placeholder="Enter workshop name"
                              value={operationData.workshop}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  workshop: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="jobType" className="text-sm font-medium">Job Type</Label>
                            <Select
                              value={operationData.jobType}
                              onValueChange={(value) =>
                                setOperationData({
                                  ...operationData,
                                  jobType: value,
                                })
                              }
                            >
                              <SelectTrigger className="h-10 w-64">
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Warranty Job">Warranty Job</SelectItem>
                                <SelectItem value="Paid Service">Paid Service</SelectItem>
                                <SelectItem value="Paid Job">Paid Job</SelectItem>
                                <SelectItem value="FOC">FOC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* AMC/Non AMC */}
                        <div className="space-y-3">
                          <Label htmlFor="amcNonAmcVehicle" className="text-sm font-medium">AMC/Non AMC</Label>
                          <Select
                            value={operationData.amcNonAmc}
                            onValueChange={(val) => setOperationData({ ...operationData, amcNonAmc: val })}
                          >
                            <SelectTrigger id="amcNonAmcVehicle" className="h-10 w-80">
                              <SelectValue placeholder="Select AMC/Non AMC" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AMC">AMC</SelectItem>
                              <SelectItem value="Non AMC">Non AMC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Complaints and Action Taken */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="complaints" className="text-sm font-medium">Complaint</Label>
                            <Textarea
                              id="complaints"
                              placeholder="Enter complaints details"
                              value={operationData.complaints}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  complaints: e.target.value,
                                })
                              }
                              rows={3}
                              className="resize-none w-96"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="actionTaken" className="text-sm font-medium">Action Taken</Label>
                            <Textarea
                              id="actionTaken"
                              placeholder="Enter action taken details"
                              value={operationData.actionTaken}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  actionTaken: e.target.value,
                                })
                              }
                              rows={3}
                              className="resize-none w-96"
                            />
                          </div>
                        </div>

                        {/* Veh Ready Date from W/S and Work Order No */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="vehReadyDateFromWS" className="text-sm font-medium">Veh Ready Date from W/S</Label>
                            <Input
                              id="vehReadyDateFromWS"
                              type="date"
                              value={operationData.vehReadyDateFromWS}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  vehReadyDateFromWS: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="workOrderNo" className="text-sm font-medium">Work Order No.</Label>
                            <Input
                              id="workOrderNo"
                              placeholder="Work Order Number"
                              value={operationData.workOrderNo}
                              readOnly
                              className="h-10 w-64 bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* Invoice No and Invoice Date */}
                        <div className="flex gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="invoiceNo" className="text-sm font-medium">Invoice No.</Label>
                            <Input
                              id="invoiceNo"
                              placeholder="Enter invoice number"
                              value={operationData.invoiceNo}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  invoiceNo: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</Label>
                            <Input
                              id="invoiceDate"
                              type="date"
                              value={operationData.invoiceDate}
                              onChange={(e) =>
                                setOperationData({
                                  ...operationData,
                                  invoiceDate: e.target.value,
                                })
                              }
                              className="h-10 w-64"
                            />
                          </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="border-t pt-8 mt-8">
                          <h4 className="text-xl font-semibold mb-8">Additional Details</h4>

                          {/* Spare and Spare Without Tax */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="spareWithoutTax" className="text-sm font-medium">Spare Without Tax</Label>
                              <Input
                                id="spareWithoutTax"
                                type="number"
                                placeholder="Enter spare without tax amount"
                                value={operationData.spareWithoutTax}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    spareWithoutTax: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Spare with 18% GST and 28% GST */}
                          <div className="flex gap-8 mb-8">
                            <div className='space-y-3'>
                              <Label htmlFor="spareWith5GST" className="text-sm font-medium">Spare with 5% GST</Label>
                              <Input
                                id="spareWith5GST"
                                type="number"
                                placeholder="Enter Spare with 5% GST"
                                value={operationData.spareWith5GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith5GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="spareWith18GST" className="text-sm font-medium">Spare with 18% GST</Label>
                              <Input
                                id="spareWith18GST"
                                type="number"
                                placeholder="Enter Spare with 18% GST"
                                value={operationData.spareWith18GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith18GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="spareWith28GST" className="text-sm font-medium">Spare with 28% GST</Label>
                              <Input
                                id="spareWith28GST"
                                type="number"
                                placeholder="Enter Spare with 28% GST"
                                value={operationData.spareWith28GST}
                                onChange={(e) => setOperationData({ ...operationData, spareWith28GST: e.target.value })}
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Labour and Outside Labour */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="labour" className="text-sm font-medium">Labour</Label>
                              <Input
                                id="labour"
                                type="number"
                                placeholder="Enter labour amount"
                                value={operationData.labour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    labour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="outsideLabour" className="text-sm font-medium">Outside Labour</Label>
                              <Input
                                id="outsideLabour"
                                type="number"
                                placeholder="Enter outside labour amount"
                                value={operationData.outsideLabour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    outsideLabour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>
                          </div>

                          {/* Discount on Parts and GST on Parts */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="discountOnParts" className="text-sm font-medium">Discount on Parts</Label>
                              <Select
                                value={operationData.discountOnParts}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    discountOnParts: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select discount percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="gstOnParts" className="text-sm font-medium">GST on Parts</Label>
                              <Select
                                value={operationData.gstOnParts}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    gstOnParts: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select GST percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='5%'>5%</SelectItem>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              {operationData.gstOnParts && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    type="number"
                                    placeholder="Custom % 1"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnPartsCustom1}
                                    onChange={e => setOperationData({ ...operationData, gstOnPartsCustom1: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Custom % 2"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnPartsCustom2}
                                    onChange={e => setOperationData({ ...operationData, gstOnPartsCustom2: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Discount Labour and GST on Labour */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="discountLabour" className="text-sm font-medium">Discount Labour (%)</Label>
                              <Input
                                id="discountLabour"
                                type="number"
                                placeholder="Enter discount labour percentage"
                                value={operationData.discountLabour}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    discountLabour: e.target.value,
                                  })
                                }
                                className="h-10 w-64 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="gstOnLabour" className="text-sm font-medium">GST on Labour</Label>
                              <Select
                                value={operationData.gstOnLabour}
                                onValueChange={(value) =>
                                  setOperationData({
                                    ...operationData,
                                    gstOnLabour: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-64">
                                  <SelectValue placeholder="Select GST percentage" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='5%'>5%</SelectItem>
                                  <SelectItem value="18%">18%</SelectItem>
                                  <SelectItem value="28%">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              {operationData.gstOnLabour && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    type="number"
                                    placeholder="Custom % 1"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnLabourCustom1}
                                    onChange={e => setOperationData({ ...operationData, gstOnLabourCustom1: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Custom % 2"
                                    className="h-8 w-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                    value={operationData.gstOnLabourCustom2}
                                    onChange={e => setOperationData({ ...operationData, gstOnLabourCustom2: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>


                          {/* Total Amount Fields */}
                          <div className="flex gap-12 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="totalInvAmountPayable" className="text-sm font-medium">Total Inv Amount Payable</Label>
                              <Input
                                id="totalInvAmountPayable"
                                type="text"
                                placeholder="Calculated total"
                                value={calculateTotalAmounts().totalInvAmountPayable}
                                readOnly
                                className="bg-gray-50 h-10 w-64"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="totalAmountWithDiscountButWithoutTax" className="text-sm font-medium">Total Amount with Discount but Without Tax</Label>
                              <Input
                                id="totalAmountWithDiscountButWithoutTax"
                                type="text"
                                placeholder="Calculated total"
                                value={calculateTotalAmounts().totalAmountWithDiscountButWithoutTax}
                                readOnly
                                className="bg-gray-50 h-10 w-64"
                              />
                            </div>
                          </div>

                          {/* Remark and Description */}
                          <div className="flex gap-8 mb-8">
                            <div className="space-y-3">
                              <Label htmlFor="remark" className="text-sm font-medium">Remark</Label>
                              <Textarea
                                id="remark"
                                placeholder="Enter remarks"
                                value={operationData.remark}
                                onChange={(e) =>
                                  setOperationData({
                                    ...operationData,
                                    remark: e.target.value,
                                  })
                                }
                                rows={3}
                                className="resize-none w-96"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
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
                                className="resize-none w-96"
                              />
                            </div>
                          </div>

                          {/* <div className="space-y-2">
                            <Label htmlFor="jobType">Job Type</Label>
                            <Select
                              value={operationData.jobType}
                              onValueChange={(value) =>
                                setOperationData({
                                  ...operationData,
                                  jobType: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Warranty Job">Warranty Job</SelectItem>
                                <SelectItem value="Paid Service">Paid Service</SelectItem>
                                <SelectItem value="Paid Job">Paid Job</SelectItem>
                                <SelectItem value="FOC">FOC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
                        </div>
                      </>
                    )}

                    {/* Common Fields */}
                    <div className="space-y-8">
                      {/* File Upload */}
                      <div className="space-y-3">
                        <Label htmlFor="invoice-bill" className="text-sm font-medium">Invoice Pic / Bill Upload</Label>
                        <Input
                          type="file"
                          id="invoice-bill"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setFile(e.target.files[0]);
                              setFileUrlPreview(URL.createObjectURL(e.target.files[0]));
                            } else {
                              setFile(null);
                              setFileUrlPreview(null);
                            }
                          }}
                          className="w-96"
                        />
                        {file && fileUrlPreview && (
                          <div className="mt-4">
                            <DocumentPreview
                              documentType={file.type || 'Document'}
                              documentUrl={fileUrlPreview}
                              label="Selected Invoice Bill Preview"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <Button
                          onClick={handleSubmit}
                          className="w-96 h-12 bg-red-600 hover:bg-red-700 text-lg font-medium"
                        >
                          Submit Operation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
                            {typeof operation.totalInvAmountPayable === 'number' && !isNaN(operation.totalInvAmountPayable)
                              ? `₹${operation.totalInvAmountPayable.toLocaleString()}`
                              : '--'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {operation.description || '--'}
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

      {/* Vehicle List Table */}
      <Card className="border-l-4 border-l-red-600">
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
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
                    Year
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                    Chassis Number
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[100px]">
                    AC Model
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 min-w-[120px]">
                    Registration Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
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
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setSearchTerm(vehicle.vehicleNumber);
                      }}
                    >
                      <td className="py-3 px-2 text-red-600 font-medium">
                        {vehicle.vehicleNumber}
                      </td>
                      <td className="py-3 px-2">{vehicle.model || '--'}</td>
                      <td className="py-3 px-2">{vehicle.make || '--'}</td>
                      <td className="py-3 px-2">{vehicle.companyName || '--'}</td>
                      <td className="py-3 px-2">{vehicle.branch || '--'}</td>
                      <td className="py-3 px-2">{vehicle.year || '--'}</td>
                      <td className="py-3 px-2 text-xs">{vehicle.chassisNumber || '--'}</td>
                      <td className="py-3 px-2">{vehicle.acModel || '--'}</td>
                      <td className="py-3 px-2 text-xs">
                        {vehicle.registrationDate
                          ? new Date(vehicle.registrationDate).toLocaleDateString()
                          : '--'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
