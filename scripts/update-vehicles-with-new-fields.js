const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mainffc';

// Helper function to generate dummy dates
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to calculate days left
function calculateDaysLeft(date) {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

async function updateVehiclesWithNewFields() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('mainffc');
    
    console.log('Fetching existing vehicles...');
    const vehicles = await db.collection('vehicles').find({}).toArray();
    console.log(`Found ${vehicles.length} vehicles to update`);

    // Update each vehicle with new fields
    for (const vehicle of vehicles) {
      // Generate dummy dates for the new fields
      const insurance = getRandomDate(new Date('2024-01-01'), new Date('2026-12-31'));
      const roadtax = getRandomDate(new Date('2024-01-01'), new Date('2026-12-31'));
      const puc = getRandomDate(new Date('2024-01-01'), new Date('2025-12-31'));
      const fitness = getRandomDate(new Date('2024-01-01'), new Date('2027-12-31'));
      const goodsPermit = getRandomDate(new Date('2024-01-01'), new Date('2030-12-31'));
      const nationalPermit = getRandomDate(new Date('2024-01-01'), new Date('2026-12-31'));
      
      // Calculate days left for each field
      const insuranceDaysLeft = calculateDaysLeft(insurance);
      const roadTaxDaysLeft = calculateDaysLeft(roadtax);
      const pucDaysLeft = calculateDaysLeft(puc);
      const fitnessDaysLeft = calculateDaysLeft(fitness);
      const goodsPermitDaysLeft = calculateDaysLeft(goodsPermit);
      const nationalPermitDaysLeft = calculateDaysLeft(nationalPermit);

      // Update the vehicle with new fields
      await db.collection('vehicles').updateOne(
        { _id: vehicle._id },
        {
          $set: {
            // New date fields
            insurance,
            roadtax,
            puc,
            fitness,
            goodsPermit,
            nationalPermit,
            rc: 'RC In Office',
            remark: '',
            // Calculated days left fields
            insuranceDaysLeft,
            roadTaxDaysLeft,
            pucDaysLeft,
            fitnessDaysLeft,
            goodsPermitDaysLeft,
            nationalPermitDaysLeft,
            updatedAt: new Date()
          }
        }
      );
    }

    console.log(`Successfully updated ${vehicles.length} vehicles with new fields`);
    console.log('New fields added:');
    console.log('- insurance (date)');
    console.log('- roadtax (date)');
    console.log('- puc (date)');
    console.log('- fitness (date)');
    console.log('- goodsPermit (date)');
    console.log('- nationalPermit (date)');
    console.log('- rc (string)');
    console.log('- remark (string)');
    console.log('- insuranceDaysLeft (calculated)');
    console.log('- roadTaxDaysLeft (calculated)');
    console.log('- pucDaysLeft (calculated)');
    console.log('- fitnessDaysLeft (calculated)');
    console.log('- goodsPermitDaysLeft (calculated)');
    console.log('- nationalPermitDaysLeft (calculated)');

  } catch (error) {
    console.error('Error updating vehicles:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the update function
updateVehiclesWithNewFields();
