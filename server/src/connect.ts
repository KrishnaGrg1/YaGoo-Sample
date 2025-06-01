import mongoose from 'mongoose';
import env from './Ienv';

const connectToDB = async (): Promise<string> => {
  const mongoDBUrl = env.MONGODB_URL;
  console.log('MongoDB URL:', mongoDBUrl);

  if (!mongoDBUrl) {
    return Promise.reject(
      'MONGODB_URL is not defined in environment variables'
    );
  }

  try {
    await mongoose.connect(mongoDBUrl);
    return 'MongoDB connected';
  } catch (error) {
    if (error instanceof Error) {
      return Promise.reject(error.message);
    }
    return Promise.reject(
      'An unknown error occurred while connecting to MongoDB'
    );
  }
};

export default connectToDB;
