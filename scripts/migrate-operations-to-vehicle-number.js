const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mainffc';

async function migrateOperationsToVehicleNumber() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('mainffc');
    
    console.log('Fetching operations with vehicleId...');
    const operations = await db.collection('operations').find({
      vehicleId: { $exists: true },
      vehicleNumber: { $exists: false }
    }).toArray();
    
    console.log(`Found ${operations.length} operations to migrate`);

    // Update each operation with vehicleNumber
    for (const operation of operations) {
      if (operation.vehicleId) {
        // Find the vehicle by vehicleId (convert string to ObjectId)
        let vehicle;
        try {
          // Convert string vehicleId to ObjectId
          const vehicleObjectId = new ObjectId(operation.vehicleId);
          vehicle = await db.collection('vehicles').findOne({
            _id: vehicleObjectId
          });
        } catch (error) {
          console.log(`Invalid ObjectId format for vehicleId: ${operation.vehicleId}`);
          continue;
        }
        
        if (vehicle && vehicle.vehicleNumber) {
          // Update the operation to include vehicleNumber
          await db.collection('operations').updateOne(
            { _id: operation._id },
            {
              $set: {
                vehicleNumber: vehicle.vehicleNumber,
                updatedAt: new Date()
              }
            }
          );
          console.log(`Updated operation ${operation._id} with vehicleNumber: ${vehicle.vehicleNumber}`);
        } else {
          console.log(`Vehicle not found for operation ${operation._id} with vehicleId: ${operation.vehicleId}`);
        }
      }
    }

    console.log(`Successfully migrated ${operations.length} operations`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Error migrating operations:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the migration function
migrateOperationsToVehicleNumber();
