const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mainffc';

async function addVerificationData() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('mainffc');
    
    // Get existing vehicles
    const vehicles = await db.collection('vehicles').find({}).toArray();
    console.log(`Found ${vehicles.length} vehicles`);
    
    // Clear existing verification data
    await db.collection('verification').deleteMany({});
    console.log('Cleared existing verification data');
    
    // Generate verification data for each vehicle
    const verificationData = [];
    
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      
      // Generate dates for each document type
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
      
      // PUC (Pollution Under Control) - expires every 6 months
      const pucCreated = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
      const pucExpiry = new Date(pucCreated.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
      const isPucExpired = pucExpiry < now;
      
      // RC (Registration Certificate) - expires every 15 years
      const rcCreated = new Date(twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime()));
      const rcExpiry = new Date(rcCreated.getTime() + (15 * 365 * 24 * 60 * 60 * 1000));
      const isRcExpired = rcExpiry < now;
      
      // NP (National Permit) - expires every 5 years
      const npCreated = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
      const npExpiry = new Date(npCreated.getTime() + (5 * 365 * 24 * 60 * 60 * 1000));
      const isNpExpired = npExpiry < now;
      
      // Insurance - expires every year
      const insuranceCreated = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
      const insuranceExpiry = new Date(insuranceCreated.getTime() + (365 * 24 * 60 * 60 * 1000));
      const isInsuranceExpired = insuranceExpiry < now;
      
      // Force some documents to be expired for demonstration
      const forceExpired = Math.random() < 0.3; // 30% chance to force expiry
      
      // Create verification records for each document type
      const documents = [
        {
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          documentType: 'PUC',
          documentNumber: `PUC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          createdDate: pucCreated,
          expiryDate: forceExpired ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : pucExpiry,
          isExpired: forceExpired || isPucExpired,
          issuingAuthority: 'Pollution Control Board',
          status: (forceExpired || isPucExpired) ? 'expired' : 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          documentType: 'RC',
          documentNumber: `RC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          createdDate: rcCreated,
          expiryDate: forceExpired ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : rcExpiry,
          isExpired: forceExpired || isRcExpired,
          issuingAuthority: 'RTO',
          status: (forceExpired || isRcExpired) ? 'expired' : 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          documentType: 'NP',
          documentNumber: `NP${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          createdDate: npCreated,
          expiryDate: forceExpired ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : npExpiry,
          isExpired: forceExpired || isNpExpired,
          issuingAuthority: 'Transport Department',
          status: (forceExpired || isNpExpired) ? 'expired' : 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          documentType: 'Insurance',
          documentNumber: `INS${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          createdDate: insuranceCreated,
          expiryDate: forceExpired ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : insuranceExpiry,
          isExpired: forceExpired || isInsuranceExpired,
          issuingAuthority: 'Insurance Company',
          status: (forceExpired || isInsuranceExpired) ? 'expired' : 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      verificationData.push(...documents);
    }
    
    // Insert verification data
    await db.collection('verification').insertMany(verificationData);
    console.log(`Inserted ${verificationData.length} verification records`);
    
    // Count expired documents
    const expiredCount = verificationData.filter(doc => doc.isExpired).length;
    const pucExpired = verificationData.filter(doc => doc.documentType === 'PUC' && doc.isExpired).length;
    const rcExpired = verificationData.filter(doc => doc.documentType === 'RC' && doc.isExpired).length;
    const npExpired = verificationData.filter(doc => doc.documentType === 'NP' && doc.isExpired).length;
    const insuranceExpired = verificationData.filter(doc => doc.documentType === 'Insurance' && doc.isExpired).length;
    
    console.log('\n=== Verification Data Summary ===');
    console.log(`Total documents: ${verificationData.length}`);
    console.log(`Expired documents: ${expiredCount}`);
    console.log(`PUC expired: ${pucExpired}`);
    console.log(`RC expired: ${rcExpired}`);
    console.log(`NP expired: ${npExpired}`);
    console.log(`Insurance expired: ${insuranceExpired}`);
    
  } catch (error) {
    console.error('Error adding verification data:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the function
addVerificationData();
