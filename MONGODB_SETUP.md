# MongoDB Setup Guide

This project has been migrated from Supabase to MongoDB. Follow these steps to set up and use the MongoDB database.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - For local installation: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - For cloud: [MongoDB Atlas](https://www.mongodb.com/atlas)

2. **Node.js Dependencies**
   ```bash
   npm install
   ```

## Environment Setup

1. **Create Environment File**
   - Copy `env.example` to `.env.local`
   - Update the `MONGO_URI` with your MongoDB connection string

2. **MongoDB Connection Strings**
   
   **Local MongoDB:**
   ```
   MONGO_URI=mongodb://localhost:27017/vehicle_management
   ```
   
   **MongoDB Atlas (Cloud):**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vehicle_management?retryWrites=true&w=majority
   ```

## Database Schema

The application uses the following MongoDB collections:

### 1. Vehicles Collection
- **Fields**: vehicleNumber, model, branch, status, year, color, fuelType, seatingCapacity, engineNumber, chassisNumber, registrationDate, insuranceExpiry, fitnessExpiry, pucExpiry
- **Status**: active, inactive, maintenance

### 2. Drivers Collection
- **Fields**: driverId, name, email, phone, licenseNumber, licenseExpiry, address, emergencyContact, emergencyPhone, bloodGroup, dateOfBirth, joiningDate, status, vehicleId
- **Status**: active, inactive, suspended

### 3. Tickets Collection
- **Fields**: ticketNumber, vehicleId, driverId, issueType, priority, status, description, reportedBy, assignedTo, estimatedCost, actualCost, resolution
- **Issue Types**: mechanical, electrical, accident, breakdown, maintenance, other
- **Priority**: low, medium, high, urgent
- **Status**: open, in_progress, resolved, closed

### 4. Maintenances Collection
- **Fields**: vehicleId, driverId, maintenanceType, serviceType, description, cost, partsUsed, laborCost, totalCost, serviceProvider, serviceDate, nextServiceDate, odometerReading, status, notes
- **Maintenance Types**: scheduled, emergency, preventive, corrective
- **Service Types**: oil_change, brake_service, engine_service, tire_service, battery_service, general_service

### 5. Vehicle Documents Collection
- **Fields**: vehicleId, documentType, documentNumber, issueDate, expiryDate, issuingAuthority, fileUrl, isActive
- **Document Types**: RC, Insurance, PUC, Fitness, Tax, Permit, NP

### 6. Operations Collection
- **Fields**: vehicleId, driverId, operationType, description, amount, location, operationDate, receiptNumber, receiptUrl, status, approvedBy
- **Operation Types**: fuel, toll, parking, repair, maintenance, other

## Seeding the Database

To populate the database with dummy data:

```bash
npm run seed
```

This will create:
- 20 vehicles
- 15 drivers
- 30 tickets
- 25 maintenance records
- 50 vehicle documents
- 40 operations

## Database Service Usage

```typescript
import { db } from './lib/supabase';

// Get database instance
const database = await db.getInstance();

// Example: Get all vehicles
const vehicles = await database.getVehicles();

// Example: Create a new vehicle
const newVehicle = await database.createVehicle({
  vehicleNumber: 'MH01AB1234',
  model: 'Toyota Innova',
  branch: 'Mumbai',
  status: 'active',
  year: 2023,
  color: 'White',
  fuelType: 'diesel',
  seatingCapacity: 7,
  engineNumber: 'ENG123456',
  chassisNumber: 'CHS123456',
  registrationDate: new Date(),
  insuranceExpiry: new Date('2024-12-31'),
  fitnessExpiry: new Date('2024-12-31'),
  pucExpiry: new Date('2024-12-31'),
});

// Example: Get tickets for a specific vehicle
const vehicleTickets = await database.getTicketsByVehicleId(vehicleId);
```

## API Routes

The application provides API routes for database operations:

- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create a new vehicle
- `GET /api/vehicles/[id]` - Get vehicle by ID
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

Similar routes exist for drivers, tickets, maintenances, and operations.

## Migration from Supabase

The following changes were made during migration:

1. **Database Connection**: Replaced Supabase client with MongoDB client
2. **Schema Changes**: Updated field names to use camelCase (MongoDB convention)
3. **Type Definitions**: Updated TypeScript interfaces for MongoDB ObjectId
4. **API Routes**: Updated to use MongoDB operations instead of Supabase queries

## Troubleshooting

1. **Connection Issues**
   - Verify MongoDB is running (if using local installation)
   - Check connection string format
   - Ensure network access (for Atlas)

2. **Authentication Issues**
   - Verify username/password in connection string
   - Check database user permissions

3. **Data Issues**
   - Run `npm run seed` to reset with fresh dummy data
   - Check MongoDB logs for errors

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
