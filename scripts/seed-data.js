const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mainffc';

// Enhanced dummy data generators
const vehicleModels = [
  'Toyota Innova Crysta', 'Maruti Swift Dzire', 'Honda City VX', 'Hyundai Creta SX', 
  'Tata Nexon XZ+', 'Mahindra XUV300 W8', 'Ford EcoSport Titanium', 'Nissan Magnite XV',
  'Toyota Fortuner 4WD', 'Maruti Ertiga ZDI', 'Honda Amaze VX', 'Hyundai Venue SX',
  'Tata Harrier XZ', 'Mahindra Bolero Power+', 'Ford Endeavour Titanium', 'Nissan Kicks XV',
  'Toyota Camry Hybrid', 'Maruti Vitara Brezza ZDI+', 'Honda WR-V VX', 'Hyundai i20 Asta'
];
const branches = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Brown', 'Green', 'Orange', 'Yellow'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
const issueTypes = ['mechanical', 'electrical', 'accident', 'breakdown', 'maintenance', 'other'];
const maintenanceTypes = ['scheduled', 'emergency', 'preventive', 'corrective'];
const serviceTypes = ['oil_change', 'brake_service', 'engine_service', 'tire_service', 'battery_service', 'general_service'];
const documentTypes = ['RC', 'Insurance', 'PUC', 'Fitness', 'Tax', 'Permit', 'NP'];
const operationTypes = ['fuel', 'toll', 'parking', 'repair', 'maintenance', 'other'];
const serviceProviders = ['AutoCare Center', 'Quick Service', 'Pro Mechanics', 'Car Care Plus', 'Expert Auto', 'Premium Service', 'Reliable Motors', 'Fast Fix'];
const issuingAuthorities = ['RTO Mumbai', 'RTO Delhi', 'RTO Bangalore', 'RTO Chennai', 'RTO Kolkata', 'RTO Pune', 'RTO Hyderabad', 'RTO Ahmedabad'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateVehicleNumber() {
  const states = ['MH', 'DL', 'KA', 'TN', 'WB', 'GJ', 'RJ', 'UP'];
  const state = getRandomElement(states);
  const district = Math.floor(Math.random() * 99).toString().padStart(2, '0');
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${state}${district}${series}${number}`;
}

function generateLicenseNumber() {
  const states = ['MH', 'DL', 'KA', 'TN', 'WB', 'GJ', 'RJ', 'UP'];
  const state = getRandomElement(states);
  const year = Math.floor(Math.random() * 20) + 2004;
  const number = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `${state}${year}${number}`;
}

function generatePhoneNumber() {
  const prefixes = ['9', '8', '7', '6'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91${prefix}${number}`;
}

function generateEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = getRandomElement(domains);
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  return `${cleanName}${Math.floor(Math.random() * 100)}@${domain}`;
}

async function seedDatabase() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('mainffc');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('vehicles').deleteMany({});
    await db.collection('drivers').deleteMany({});
    await db.collection('tickets').deleteMany({});
    await db.collection('maintenances').deleteMany({});
    await db.collection('vehicle_documents').deleteMany({});
    await db.collection('operations').deleteMany({});
    console.log('Cleared existing data...');

    // Generate vehicles (50 vehicles)
    console.log('Generating vehicles...');
    const vehicles = [];
    for (let i = 0; i < 50; i++) {
      const registrationDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
      const insuranceExpiry = getRandomDate(new Date(), new Date(2025, 11, 31));
      const fitnessExpiry = getRandomDate(new Date(), new Date(2025, 11, 31));
      const pucExpiry = getRandomDate(new Date(), new Date(2024, 11, 31));
      
      vehicles.push({
        vehicleNumber: generateVehicleNumber(),
        model: getRandomElement(vehicleModels),
        branch: getRandomElement(branches),
        status: getRandomElement(['active', 'inactive', 'maintenance']),
        year: Math.floor(Math.random() * 10) + 2014,
        color: getRandomElement(colors),
        fuelType: getRandomElement(fuelTypes),
        seatingCapacity: Math.floor(Math.random() * 8) + 4,
        engineNumber: `ENG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        chassisNumber: `CHS${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        registrationDate,
        insuranceExpiry,
        fitnessExpiry,
        pucExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert vehicles
    const vehicleResult = await db.collection('vehicles').insertMany(vehicles);
    const vehicleIds = Object.values(vehicleResult.insertedIds);
    console.log(`Inserted ${vehicles.length} vehicles`);

    // Generate drivers (30 drivers)
    console.log('Generating drivers...');
    const driverNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Patel', 'Vikram Gupta',
      'Meera Reddy', 'Suresh Nair', 'Kavita Joshi', 'Ravi Verma', 'Anita Das',
      'Manoj Tiwari', 'Deepa Iyer', 'Kiran Rao', 'Laxmi Devi', 'Sanjay Malhotra',
      'Pooja Agarwal', 'Rohit Jain', 'Sneha Menon', 'Arjun Khanna', 'Divya Nair',
      'Rahul Sharma', 'Kavya Patel', 'Suresh Kumar', 'Priyanka Singh', 'Vikash Gupta',
      'Anita Reddy', 'Rajesh Nair', 'Sunita Joshi', 'Amit Verma', 'Deepika Das'
    ];

    const drivers = [];
    for (let i = 0; i < 30; i++) {
      const joiningDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
      const licenseExpiry = getRandomDate(new Date(), new Date(2026, 11, 31));
      const dateOfBirth = getRandomDate(new Date(1970, 0, 1), new Date(1995, 11, 31));
      
      drivers.push({
        driverId: `DRV${(i + 1).toString().padStart(3, '0')}`,
        name: driverNames[i] || `Driver ${i + 1}`,
        email: generateEmail(driverNames[i] || `Driver${i + 1}`),
        phone: generatePhoneNumber(),
        licenseNumber: generateLicenseNumber(),
        licenseExpiry,
        address: `${Math.floor(Math.random() * 100)} Street, ${getRandomElement(branches)}`,
        emergencyContact: `Emergency Contact ${i + 1}`,
        emergencyPhone: generatePhoneNumber(),
        bloodGroup: getRandomElement(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-']),
        dateOfBirth,
        joiningDate,
        status: getRandomElement(['active', 'inactive', 'suspended']),
        vehicleId: i < 10 ? vehicleIds[i] : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert drivers
    const driverResult = await db.collection('drivers').insertMany(drivers);
    const driverIds = Object.values(driverResult.insertedIds);
    console.log(`Inserted ${drivers.length} drivers`);

    // Generate tickets (100 tickets)
    console.log('Generating tickets...');
    const tickets = [];
    for (let i = 0; i < 100; i++) {
      const createdAt = getRandomDate(new Date(2023, 0, 1), new Date());
      const resolvedAt = Math.random() > 0.3 ? getRandomDate(createdAt, new Date()) : undefined;
      
      tickets.push({
        ticketNumber: `TKT${(i + 1).toString().padStart(4, '0')}`,
        vehicleId: getRandomElement(vehicleIds),
        driverId: Math.random() > 0.2 ? getRandomElement(driverIds) : undefined,
        issueType: getRandomElement(issueTypes),
        priority: getRandomElement(['low', 'medium', 'high', 'urgent']),
        status: resolvedAt ? getRandomElement(['resolved', 'closed']) : getRandomElement(['open', 'in_progress']),
        description: `Issue description for ticket ${i + 1}`,
        reportedBy: getRandomElement(driverNames),
        assignedTo: Math.random() > 0.3 ? getRandomElement(driverNames) : undefined,
        estimatedCost: Math.floor(Math.random() * 5000) + 500,
        actualCost: Math.floor(Math.random() * 5000) + 500,
        resolution: resolvedAt ? `Resolution for ticket ${i + 1}` : undefined,
        createdAt,
        updatedAt: new Date(),
        resolvedAt,
        closedAt: resolvedAt && Math.random() > 0.5 ? getRandomDate(resolvedAt, new Date()) : undefined,
      });
    }

    // Insert tickets
    await db.collection('tickets').insertMany(tickets);
    console.log(`Inserted ${tickets.length} tickets`);

    // Generate maintenances (75 maintenances)
    console.log('Generating maintenances...');
    const maintenances = [];
    for (let i = 0; i < 75; i++) {
      const serviceDate = getRandomDate(new Date(2023, 0, 1), new Date());
      const nextServiceDate = getRandomDate(serviceDate, new Date(2024, 11, 31));
      
      const partsUsed = [
        {
          name: 'Engine Oil',
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: Math.floor(Math.random() * 500) + 200,
          totalPrice: 0,
        },
        {
          name: 'Air Filter',
          quantity: 1,
          unitPrice: Math.floor(Math.random() * 300) + 100,
          totalPrice: 0,
        }
      ];
      
      partsUsed.forEach(part => {
        part.totalPrice = part.quantity * part.unitPrice;
      });
      
      const laborCost = Math.floor(Math.random() * 2000) + 500;
      const totalCost = partsUsed.reduce((sum, part) => sum + part.totalPrice, 0) + laborCost;
      
      maintenances.push({
        vehicleId: getRandomElement(vehicleIds),
        driverId: Math.random() > 0.3 ? getRandomElement(driverIds) : undefined,
        maintenanceType: getRandomElement(maintenanceTypes),
        serviceType: getRandomElement(serviceTypes),
        description: `Maintenance service ${i + 1}`,
        cost: totalCost,
        partsUsed,
        laborCost,
        totalCost,
        serviceProvider: getRandomElement(serviceProviders),
        serviceDate,
        nextServiceDate,
        odometerReading: Math.floor(Math.random() * 100000) + 10000,
        status: getRandomElement(['scheduled', 'in_progress', 'completed', 'cancelled']),
        notes: `Notes for maintenance ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert maintenances
    await db.collection('maintenances').insertMany(maintenances);
    console.log(`Inserted ${maintenances.length} maintenances`);

    // Generate vehicle documents (150 documents)
    console.log('Generating vehicle documents...');
    const vehicleDocuments = [];
    for (let i = 0; i < 150; i++) {
      const issueDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
      const expiryDate = getRandomDate(new Date(), new Date(2025, 11, 31));
      
      vehicleDocuments.push({
        vehicleId: getRandomElement(vehicleIds),
        documentType: getRandomElement(documentTypes),
        documentNumber: `DOC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        issueDate,
        expiryDate,
        issuingAuthority: getRandomElement(issuingAuthorities),
        fileUrl: `https://example.com/documents/${i + 1}.pdf`,
        isActive: Math.random() > 0.1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert vehicle documents
    await db.collection('vehicle_documents').insertMany(vehicleDocuments);
    console.log(`Inserted ${vehicleDocuments.length} vehicle documents`);

    // Generate operations (200 operations)
    console.log('Generating operations...');
    const operations = [];
    for (let i = 0; i < 200; i++) {
      const operationDate = getRandomDate(new Date(2023, 0, 1), new Date());
      
      operations.push({
        vehicleId: getRandomElement(vehicleIds),
        driverId: Math.random() > 0.2 ? getRandomElement(driverIds) : undefined,
        operationType: getRandomElement(operationTypes),
        description: `Operation ${i + 1} description`,
        amount: Math.floor(Math.random() * 2000) + 100,
        location: getRandomElement(branches),
        operationDate,
        receiptNumber: `RCP${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        receiptUrl: `https://example.com/receipts/${i + 1}.jpg`,
        status: getRandomElement(['pending', 'approved', 'rejected']),
        approvedBy: Math.random() > 0.3 ? getRandomElement(driverNames) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert operations
    await db.collection('operations').insertMany(operations);
    console.log(`Inserted ${operations.length} operations`);

    console.log('\n=== Database Seeding Completed Successfully! ===');
    console.log(`Vehicles: ${vehicles.length}`);
    console.log(`Drivers: ${drivers.length}`);
    console.log(`Tickets: ${tickets.length}`);
    console.log(`Maintenances: ${maintenances.length}`);
    console.log(`Vehicle Documents: ${vehicleDocuments.length}`);
    console.log(`Operations: ${operations.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the seeding function
seedDatabase();
