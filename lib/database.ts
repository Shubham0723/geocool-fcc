import { getDatabase } from './mongodb';
import { Vehicle, Driver, Ticket, Maintenance, VehicleDocument, Operation } from './schemas';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: any;

  private constructor() {}

  public static async getInstance(): Promise<DatabaseService> {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      DatabaseService.instance.db = await getDatabase();
    }
    return DatabaseService.instance;
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return await this.db.collection('vehicles').find({}).toArray();
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return await this.db.collection('vehicles').findOne({ _id: id });
  }

  async createVehicle(vehicle: Omit<Vehicle, '_id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const now = new Date();
    const newVehicle = {
      ...vehicle,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('vehicles').insertOne(newVehicle);
    return { ...newVehicle, _id: result.insertedId };
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const result = await this.db.collection('vehicles').findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await this.db.collection('vehicles').deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Driver operations
  async getDrivers(): Promise<Driver[]> {
    return await this.db.collection('drivers').find({}).toArray();
  }

  async getDriverById(id: string): Promise<Driver | null> {
    return await this.db.collection('drivers').findOne({ _id: id });
  }

  async createDriver(driver: Omit<Driver, '_id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const now = new Date();
    const newDriver = {
      ...driver,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('drivers').insertOne(newDriver);
    return { ...newDriver, _id: result.insertedId };
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | null> {
    const result = await this.db.collection('drivers').findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const result = await this.db.collection('drivers').deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    return await this.db.collection('tickets').find({}).toArray();
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    return await this.db.collection('tickets').findOne({ _id: id });
  }

  async getTicketsByVehicleId(vehicleId: string): Promise<Ticket[]> {
    return await this.db.collection('tickets').find({ vehicleId }).toArray();
  }

  async createTicket(ticket: Omit<Ticket, '_id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const now = new Date();
    const newTicket = {
      ...ticket,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('tickets').insertOne(newTicket);
    return { ...newTicket, _id: result.insertedId };
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const result = await this.db.collection('tickets').findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await this.db.collection('tickets').deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Maintenance operations
  async getMaintenances(): Promise<Maintenance[]> {
    return await this.db.collection('maintenances').find({}).toArray();
  }

  async getMaintenanceById(id: string): Promise<Maintenance | null> {
    return await this.db.collection('maintenances').findOne({ _id: id });
  }

  async getMaintenancesByVehicleId(vehicleId: string): Promise<Maintenance[]> {
    return await this.db.collection('maintenances').find({ vehicleId }).toArray();
  }

  async createMaintenance(maintenance: Omit<Maintenance, '_id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance> {
    const now = new Date();
    const newMaintenance = {
      ...maintenance,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('maintenances').insertOne(newMaintenance);
    return { ...newMaintenance, _id: result.insertedId };
  }

  async updateMaintenance(id: string, updates: Partial<Maintenance>): Promise<Maintenance | null> {
    const result = await this.db.collection('maintenances').findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteMaintenance(id: string): Promise<boolean> {
    const result = await this.db.collection('maintenances').deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Vehicle Document operations
  async getVehicleDocuments(): Promise<VehicleDocument[]> {
    return await this.db.collection('vehicle_documents').find({}).toArray();
  }

  async getVehicleDocumentsByVehicleId(vehicleId: string): Promise<VehicleDocument[]> {
    return await this.db.collection('vehicle_documents').find({ vehicleId }).toArray();
  }

  async createVehicleDocument(document: Omit<VehicleDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<VehicleDocument> {
    const now = new Date();
    const newDocument = {
      ...document,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('vehicle_documents').insertOne(newDocument);
    return { ...newDocument, _id: result.insertedId };
  }

  // Operation operations
  async getOperations(): Promise<Operation[]> {
    return await this.db.collection('operations').find({}).toArray();
  }

  async getOperationsByVehicleId(vehicleId: string): Promise<Operation[]> {
    return await this.db.collection('operations').find({ vehicleId }).toArray();
  }

  async createOperation(operation: Omit<Operation, '_id' | 'createdAt' | 'updatedAt'>): Promise<Operation> {
    const now = new Date();
    const newOperation = {
      ...operation,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('operations').insertOne(newOperation);
    return { ...newOperation, _id: result.insertedId };
  }
}
