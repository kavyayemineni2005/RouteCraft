const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('<username>') || uri.includes('username:password');

  if (!isPlaceholder) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB Atlas] Connection attempt to Atlas failed (${err.message}). Falling back to local/in-memory instance for development.`);
    }
  }

  // Graceful fallback for local development without Atlas credentials
  if (process.env.NODE_ENV !== 'production') {
    try {
      let MongoMemoryServer;
      try {
        MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
      } catch (e) {
        console.warn('[MongoDB Dev] mongodb-memory-server is not installed.');
      }

      if (MongoMemoryServer) {
        const mongod = await MongoMemoryServer.create({
          instance: {
            launchTimeout: 60000,
          },
        });
        const memoryUri = mongod.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[MongoDB Dev] Connected to in-memory MongoDB instance at ${memoryUri}`);
        return;
      }
    } catch (memErr) {
      console.error(`[MongoDB Dev Error] In-memory instance failed: ${memErr.message}`);
    }
  }

  console.error('[MongoDB Atlas Error] Could not establish connection to MongoDB.');
  console.error('👉 Make sure:');
  console.error('1. MONGO_URI is added in your Render Environment Variables.');
  console.error('2. MongoDB Atlas Network Access allows connections from anywhere (0.0.0.0/0).');
  console.error('3. The database user credentials and password are correct.');
};

module.exports = connectDB;
