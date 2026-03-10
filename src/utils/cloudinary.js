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

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        
        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        
        // Return only the secure_url, not the entire response
        return response.secure_url;
    } catch (error) {
        // Delete the local file on error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error('Error uploading to Cloudinary:', error.message);
        throw error; // Throw instead of returning null
    }
};

export { uploadToCloudinary };