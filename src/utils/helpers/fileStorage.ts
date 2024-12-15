import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Initialize S3 client if AWS credentials are available
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
const s3Client = hasAwsCredentials ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'nla-documents';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

export const uploadToStorage = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    // Create unique file name to prevent overwrites
    const uniqueFileName = `${Date.now()}-${fileName}`;

    // If AWS credentials are available, use S3
    if (s3Client) {
      console.log('Using S3 storage');
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueFileName,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    // Fallback to local storage
    console.log('Using local storage');
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);
    await fsPromises.writeFile(filePath, fileBuffer);
    
    // Return the public URL for the file
    return `/uploads/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file to storage');
  }
};

export const deleteFromStorage = async (fileName: string): Promise<void> => {
  try {
    if (s3Client) {
      // Delete from S3
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: fileName,
      };
      await s3Client.send(new PutObjectCommand(deleteParams));
    } else {
      // Delete from local storage
      const filePath = path.join(UPLOAD_DIR, path.basename(fileName));
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file from storage');
  }
}; 