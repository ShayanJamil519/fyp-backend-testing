import mongoose from 'mongoose';

export const connectDataBase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(process.env.CLOUDINARY_API_SECRET);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};