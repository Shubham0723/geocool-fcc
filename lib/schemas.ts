import { ObjectId } from 'mongodb';

// OTP Schema
export interface OTP {
  _id?: ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Vehicle Schema
export interface Vehicle {
  _id?: ObjectId;
  vehicleNumber: string;
  model: string;
  make?: string;
  companyName?: string;
  branch: string;
  status: 'active' | 'inactive' | 'maintenance';
  year: number;
  color: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seatingCapacity: number;
  cargoLength?: number;
  engineNumber: string;
  chassisNumber: string;
  vehicleDetails?: string;
  acModel?: string;
  registrationDate: Date;
  insuranceExpiry: Date;
  fitnessExpiry: Date;
  pucExpiry: Date;
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
  insurance: Date;
  roadtax: Date;
  puc: Date;
  fitness: Date;
  goodsPermit: Date;
  nationalPermit: Date;
  rc: string;
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
  _id?: ObjectId;
  ticketNumber: string;
  vehicleId: ObjectId;
  driverId?: ObjectId;
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
  vehicleNumber: string; // Vehicle number (string reference)
  vehicleId?: ObjectId; // Optional vehicle ID reference
  operationDate: Date; // Date when operation was recorded
  status: 'pending' | 'approved' | 'rejected' | 'completed'; // Operation status
  invoiceBill?: string; // URL to uploaded invoice bill document
  formType: 'ac-maintenance' | 'vehicle-maintenance'; // Type of form selected

  // Core Operation Details
  operationType: string; // Type of operation (from dropdown)
  subPartName?: string; // New dropdown for sub part name
  amount: number; // Original base amount entered by user
  description?: string; // General description of operation (optional)

  // Common Fields for both AC Maintenance and Vehicle Maintenance
  dateSendToWS?: string; // Date sent to workshop (dd-mm-yyyy format)
  workshop?: string; // Name of the workshop
  complaints?: string; // Details of complaints
  actionTaken?: string; // Description of action taken
  vehReadyDateFromWS?: string; // Vehicle ready date from workshop (dd-mm-yyyy format)
  invoiceNo?: string; // Invoice number
  invoiceDate?: string; // Invoice date (dd-mm-yyyy format)

  // AC Maintenance Specific Fields
  acUnit?: string; // AC unit details
  engineHrs?: number; // Engine hours
  advisorNo?: string; // Advisor number

  // Vehicle Maintenance Specific Fields
  serviceKM?: number; // Service kilometers
  workOrderNo?: string; // Work order number

  // Financial Details
  spare: '18%' | '28%' | '5%'; // Selected GST rate for spare parts
  spareWithoutTax?: number; // Amount of spare parts without tax
  labour?: number; // Labour charges
  outsideLabour?: number; // Outside labour charges
  gstOnParts: '18%' | '28%' | '5%'; // GST rate on parts
  discountLabour?: number; // Discount amount on labour
  gstOnLabour: '18%' | '28%' | ''; // GST rate on labour
  spareWith5GST: number
  spareWith18GST: number;
  spareWith28GST: number;
  // Calculated Fields
  totalInvAmountPayable?: number; // Calculated total invoice amount payable (with all taxes)
  totalAmountWithDiscountButWithoutTax?: number; // Calculated total (Spare After Discount + Labour After Discount)

  // Additional Fields
  remark?: string; // Additional remarks
  jobType: 'Warranty Job' | 'Paid Service' | 'Paid Job' | 'FOC' | ''; // Type of job
  amcNonAmc?: 'AMC' | 'Non AMC' | ''; // AMC/Non AMC selection

  // System Fields
  approvedBy?: string; // Who approved the operation
  createdAt: Date; // When record was created
  updatedAt: Date; // When record was last updated
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
  acUnit?: string; // AC Unit name/model
  date: Date;
  services: Array<{
    km:string;
    hours: string;
    serviceDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}