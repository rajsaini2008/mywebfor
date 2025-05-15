import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "dhsebufhc",
  api_key: "282789619175981",
  api_secret: "LONu1tS8eqp240QL0GdkuU2pYIk",
  secure: true
});

export default cloudinary;

export const cloudinaryUpload = async (file: Buffer, folder: string, filename?: string) => {
  return new Promise<any>((resolve, reject) => {
    // Prepare upload options
    const uploadOptions: any = { folder };
    
    // If filename is provided, use it as public_id
    if (filename) {
      // Remove file extension from filename for Cloudinary
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = filenameWithoutExt;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    uploadStream.end(file);
  });
}; 