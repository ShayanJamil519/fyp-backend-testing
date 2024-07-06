import cloudinary from "cloudinary";

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Cloudinary configured with the following details:');
  console.log(`Cloud Name: ${process.env.CLOUDINARY_NAME}`);
};

export default configureCloudinary;