/**
 * Cloud Storage Service
 * Handles file uploads to S3-compatible storage
 */

import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT, // For S3-compatible services like Cloudflare R2
  s3ForcePathStyle: !!process.env.AWS_S3_ENDPOINT, // Required for some S3-compatible services
});

/**
 * Upload file to S3
 * Returns the file URL or null if S3 is not configured
 */
export async function uploadToS3(file: Express.Multer.File): Promise<string | null> {
  // Check if S3 is configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️  S3 credentials not configured, using local storage');
    return null;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    console.warn('⚠️  S3 bucket not configured, using local storage');
    return null;
  }

  try {
    const fileContent = fs.readFileSync(file.path);
    const fileName = `complaints/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make files publicly accessible
    };

    const result = await s3.upload(params).promise();

    // Delete local file after successful upload
    fs.unlinkSync(file.path);

    return result.Location;
  } catch (error) {
    console.error('❌ S3 upload error:', error);
    return null;
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileKey: string): Promise<boolean> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return false;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return false;
  }

  try {
    await s3.deleteObject({
      Bucket: bucket,
      Key: fileKey,
    }).promise();

    return true;
  } catch (error) {
    console.error('❌ S3 delete error:', error);
    return false;
  }
}

/**
 * Generate pre-signed URL for temporary access
 */
export async function getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string | null> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return null;
  }

  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: fileKey,
      Expires: expiresIn,
    });

    return url;
  } catch (error) {
    console.error('❌ S3 signed URL error:', error);
    return null;
  }
}
