// Type definitions for the application
import { ObjectId } from 'mongodb';

// Helper type for ObjectId that can be string or ObjectId
export type ObjectIdType = ObjectId | string;

// Vehicle Schema
export interface Vehicle {
  _id?: ObjectId;
  vehicleNumber: string;
  model: string;
  make?: string;
  companyName?: string;
  branch: string;
  status: 'active' | 'inactive' | 'maintenance';
  year?: number;
  color?: string;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seatingCapacity?: number;
  cargoLength?: number;
  engineNumber?: string;
  chassisNumber?: string;
  vehicleDetails?: string;
  acModel?: string;
  registrationDate?: Date;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
  pucExpiry?: Date;
  // Legacy fields for backward compatibility
  fuel?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  cLength?: string;
  capacity?: string;
  location?: string;
  regNo?: string;
  acMode?: string;
  // Document fields - now arrays of document objects
  pucDocument?: Array<{
    pucImage: string;
    createAt: Date;
  }>;
  npDocument?: Array<{
    npImage: string;
    createAt: Date;
  }>;
  insuranceDocument?: Array<{
    insuranceImage: string;
    createAt: Date;
  }>;
  fitnessDocument?: Array<{
    fitnessImage: string;
    createAt: Date;
  }>;
  // New columns from the image
  insurance?: Date;
  roadtax?: Date;
  puc?: Date;
  fitness?: Date;
  goodsPermit?: Date;
  nationalPermit?: Date;
  rc?: string;
  insuranceDaysLeft?: number;
  roadTaxDaysLeft?: number;
  pucDaysLeft?: number;
  fitnessDaysLeft?: number;
  goodsPermitDaysLeft?: number;
  nationalPermitDaysLeft?: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Driver Schema
export interface Driver {
  _id?: ObjectId;
  driverId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodGroup: string;
  dateOfBirth: Date;
  joiningDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  vehicleId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket Schema
export interface Ticket {
  _id?: ObjectIdType;
  ticketNumber: string;
  vehicleId: ObjectIdType;
  driverId?: ObjectIdType;
  issueType: 'mechanical' | 'electrical' | 'accident' | 'breakdown' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  reportedBy: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// Maintenance Schema
export interface Maintenance {
  _id?: ObjectId;
  vehicleId: ObjectId;
  driverId?: ObjectId;
  maintenanceType: 'scheduled' | 'emergency' | 'preventive' | 'corrective';
  serviceType: 'oil_change' | 'brake_service' | 'engine_service' | 'tire_service' | 'battery_service' | 'general_service';
  description: string;
  cost: number;
  partsUsed: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  laborCost: number;
  totalCost: number;
  serviceProvider: string;
  serviceDate: Date;
  nextServiceDate?: Date;
  odometerReading: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle Document Schema
export interface VehicleDocument {
  _id?: ObjectId;
  vehicleId: ObjectId;
  documentType: 'RC' | 'Insurance' | 'PUC' | 'Fitness' | 'Tax' | 'Permit' | 'NP';
  documentNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  fileUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Operation Schema (for tracking expenses and operations)
export interface Operation {
  _id?: ObjectId;
  vehicleId: ObjectId;
  driverId?: ObjectId;
  operationType: 'vehicle_service' | 'running_repairs' | 'running_repair_parts' | 'ac_service';
  description: string;
  amount: number;
  location?: string;
  operationDate: Date;
  receiptNumber?: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  totalInvAmountPayable?: number;
  labourWithGST?: number;
  labour?: number;
  spareWith18GST?: number;
  spareWith28GST?: number;
}

// Vehicle Service Schedule Schema
export interface VehicleServiceSchedule {
  _id?: ObjectId;
  vehicleNumber: string;
  model: string;
  make?: string;
  date: Date;
  services: Array<{
    km: number;
    work: string;
    serviceDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// AC Service Schedule Schema
export interface ACServiceSchedule {
  _id?: ObjectId;
  vehicleNumber: string;
  model: string;
  make?: string;
  acSerialNumber?: string; // AC Sr. No
  acUnit?: string; // AC Unit
  date: Date;
  services: Array<{
    km: string;
    hours: string;
    serviceDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}