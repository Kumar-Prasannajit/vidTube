import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        const respose = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        console.log(`File uploaded to Cloudinary: ${respose.secure_url}`);
        fs.unlinkSync(localFilePath); //delete the file from local storage after uploading to cloudinary
        return respose;
    } catch (error) {
        fs.unlinkSync(localFilePath); //delete the file from local storage
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};

export { uploadToCloudinary };