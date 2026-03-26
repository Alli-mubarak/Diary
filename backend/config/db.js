// config/db.js
import mongoose from 'mongoose';
import 'dotenv/config'; // Loads environment variables

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are now default in recent mongoose versions, 
      // so you might not need them explicitly, but good to know:
      // useNewUrlParser: true, 
      // useUnifiedTopology: true,
      maxPoolSize: 10, // Customize pool size
      socketTimeoutMS: 45000, // Customize socket timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1); 
  }
};

export default connectDB;