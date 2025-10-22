// MongoDB Commands to create OTP collection with automatic expiration

// 1. Create the OTP collection
db.createCollection("otps");

// 2. Create TTL index for automatic expiration after 10 minutes
db.otps.createIndex(
  { "expiresAt": 1 }, 
  { 
    expireAfterSeconds: 0, // MongoDB will delete documents when expiresAt field is reached
    name: "expiresAt_ttl"
  }
);

// 3. Create compound index for efficient queries
db.otps.createIndex(
  { "email": 1, "isUsed": 1, "expiresAt": 1 },
  { name: "email_used_expires" }
);

// 4. Insert sample OTP (for testing)
db.otps.insertOne({
  email: "rayhaanhowlader4@gmail.com",
  otp: "123456",
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  isUsed: false,
  createdAt: new Date()
});

// 5. Verify the collection and indexes
db.otps.getIndexes();

// 6. Query to check OTPs
db.otps.find({}).pretty();
