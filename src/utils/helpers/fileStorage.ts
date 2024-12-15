import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'nla-documents';

export const uploadToStorage = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    // Create unique file name to prevent overwrites
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Set up the upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    // Upload the file
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate a signed URL for the uploaded file
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

    return signedUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to storage');
  }
};

// Optional: Add a function to delete files if needed
export const deleteFromStorage = async (fileName: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };

    await s3Client.send(new PutObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from storage');
  }
}; 