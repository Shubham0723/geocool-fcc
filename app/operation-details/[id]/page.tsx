"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/components/DocumentPreview';
import { useToast } from '@/hooks/use-toast';

// Types
interface Operation {
  _id: string;
  vehicleNumber?: string;
  vehicleId?: string;
  operationType?: string;
  description?: string;
  amount?: number;
  operationDate?: string;
  status: string;
  invoiceBill?: string; // Added for invoiceBill
  [key: string]: any;
}
interface Vehicle {
  _id: string;
  vehicleNumber: string;
  [key: string]: any;
}
interface Ticket {
  _id: string;
  issueType?: string;
  description?: string;
  status?: string;
  priority?: string;
  [key: string]: any;
}

const OperationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch Operation
  useEffect(() => {
    if (id) {
      fetch(`/api/operations/${id}`)
        .then((res) => res.json())
        .then((data) => setOperation(data))
        .catch(() => setOperation(null));
    }
  }, [id]);

  // Fetch Vehicle and Tickets when operation loads
  useEffect(() => {
    if (operation) {
      // Try fetching by vehicleNumber then vehicleId if needed
      const vehicleNumber = operation.vehicleNumber;
      fetch(`/api/vehicles`)
        .then(res => res.json())
        .then(allVehicles => {
          let found: Vehicle | undefined = undefined;
          if (vehicleNumber) {
            found = allVehicles.find((v: Vehicle) => v.vehicleNumber === vehicleNumber);
          }
          if (!found && operation.vehicleId) {
            found = allVehicles.find((v: Vehicle) => v._id === operation.vehicleId);
          }
          setVehicle(found || null);
        });

      let identifier = vehicleNumber || operation.vehicleId;
      if (identifier) {
        fetch(`/api/tickets`)
          .then(res => res.json())
          .then((allTickets) => {
            // tickets may have vehicleId as vehicleNumber or _id, check both
            const relevant = allTickets.filter((t: Ticket) =>
              t.vehicleId === identifier || t.vehicleNumber === identifier
            );
            setTickets(relevant);
          });
      }
    }
  }, [operation]);

  // Status dropdown change
  const handleStatusChange = async (newStatus: string) => {
    if (!operation) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/operations/${operation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setOperation({ ...operation, status: newStatus });
      } else if (res.status === 403) {
        toast({
          title: "Insufficient permissions for this operation",
          description: typeof data?.message === 'string' ? data.message : undefined,
        });
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!operation) return <div className="p-8">Loading...</div>;
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Operation Details</h1>

      {/* Status and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2 space-y-2">
          <div><b>Vehicle Number:</b> {operation.vehicleNumber || vehicle?.vehicleNumber || '--'}</div>
          <div><b>Form Type:</b> {operation.formType || '--'}</div>
          <div><b>Operation Type:</b> {operation.operationType || '--'}</div>
          <div><b>Sub Part Name:</b> {operation.subPartName || '--'}</div>
          {/* <div><b>Amount:</b> ₹{operation.amount?.toLocaleString() || '-'}</div> */}
          <div><b>Description:</b> {operation.description || '--'}</div>
          <div><b>Operation Date:</b> {operation.operationDate ? (new Date(operation.operationDate)).toLocaleDateString() : '--'}</div>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Status</label>
          <Select value={operation.status} onValueChange={handleStatusChange} disabled={statusUpdating}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workshop Details */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-3">Workshop Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><b>Date Send to W/S:</b> {operation.dateSendToWS || '--'}</div>
          <div><b>Workshop:</b> {operation.workshop || '--'}</div>
          <div><b>Vehicle Ready Date from W/S:</b> {operation.vehReadyDateFromWS || '--'}</div>
          <div><b>Invoice No:</b> {operation.invoiceNo || '--'}</div>
          <div><b>Invoice Date:</b> {operation.invoiceDate || '--'}</div>
          <div><b>Job Type:</b> {operation.jobType || '--'}</div>
          <div><b>AMC/Non AMC:</b> {operation.amcNonAmc || '--'}</div>
        </div>
      </div>

      {/* AC Maintenance Specific Fields */}
      {operation.formType === 'ac-maintenance' && (
        <div className="border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-3">AC Maintenance Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><b>AC Unit:</b> {operation.acUnit || '--'}</div>
            <div><b>Engine Hrs:</b> {operation.engineHrs || '--'}</div>
            <div><b>Advisor No:</b> {operation.advisorNo || '--'}</div>
          </div>
        </div>
      )}

      {/* Vehicle Maintenance Specific Fields */}
      {operation.formType === 'vehicle-maintenance' && (
        <div className="border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-3">Vehicle Maintenance Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><b>Service KM:</b> {operation.serviceKM || '--'}</div>
            <div><b>Work Order No:</b> {operation.workOrderNo || '--'}</div>
          </div>
        </div>
      )}

      {/* Complaints and Action Taken */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-3">Service Details</h2>
        <div className="space-y-3">
          <div>
            <b>Complaints:</b>
            <p className="mt-1 text-gray-700">{operation.complaints || '--'}</p>
          </div>
          <div>
            <b>Action Taken:</b>
            <p className="mt-1 text-gray-700">{operation.actionTaken || '--'}</p>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-3">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><b>Spare:</b> {operation.spare || '--'}</div>
          <div><b>Spare Without Tax:</b> ₹{operation.spareWithoutTax?.toLocaleString() || '--'}</div>
          <div><b>Labour:</b> ₹{operation.labour?.toLocaleString() || '-'}</div>
          <div><b>Outside Labour:</b> ₹{operation.outsideLabour?.toLocaleString() || '--'}</div>
          <div><b>Discount on Parts:</b> {operation.discountOnParts || '--'}</div>
          <div><b>GST on Parts:</b> {operation.gstOnParts || '--'}</div>
          <div><b>Discount Labour:</b> ₹{operation.discountLabour?.toLocaleString() || '--'}</div>
          <div><b>GST on Labour:</b> {operation.gstOnLabour || '--'}</div>
          <div><b>Total Inv Amount Payable:</b> ₹{operation.totalInvAmountPayable?.toLocaleString() || '--'}</div>
          <div><b>Total Amount with Discount but Without Tax:</b> ₹{operation.totalAmountWithDiscountButWithoutTax?.toLocaleString() || '--'}</div>
        </div>
      </div>

      {/* Remarks */}
      {operation.remark && (
        <div className="border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-3">Remarks</h2>
          <p className="text-gray-700">{operation.remark}</p>
        </div>
      )}
      {/* Master Data Box */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Master Data (Vehicle Details)</h2>
        {vehicle ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><b>Vehicle Number:</b> {vehicle.vehicleNumber}</div>
            <div><b>Model:</b> {vehicle.model}</div>
            <div><b>Company:</b> {vehicle.companyName}</div>
            <div><b>Branch:</b> {vehicle.branch}</div>
            <div><b>Status:</b> {vehicle.status}</div>
            {/* More vehicle fields as needed */}
          </div>
        ) : (
          <div>No linked vehicle data found.</div>
        )}
      </div>
      {/* <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Tickets for this Vehicle</h2>
        {tickets.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead><tr><th>Type</th><th>Description</th><th>Status</th><th>Priority</th></tr></thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.issueType}</td>
                  <td>{ticket.description}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div>No tickets found for this vehicle.</div>}
      </div> */}
      <div className="border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Invoice Pic / Bill Upload</h2>
        {operation.invoiceBill ? (
          <div className="mt-2">
            <DocumentPreview
              documentType={operation.invoiceBill.toLowerCase().includes('.pdf') ? 'PDF' : 'Image'}
              documentUrl={operation.invoiceBill}
              label="Invoice Bill" />
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No invoice/bill uploaded for this operation.</div>
        )}
      </div>
    </div>
  );
};

export default OperationDetailsPage;
