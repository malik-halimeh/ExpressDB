import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_api';
  
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('error', (err) => {
  console.error(`Mongoose runtime connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose connection disconnected');
});

// Graceful shutdown on application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error(`Error during Mongoose connection closure: ${err.message}`);
    process.exit(1);
  }
});

export default connectDB;
