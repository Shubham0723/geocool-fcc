import axios from 'axios';
import { createReadStream } from 'node:fs';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: './google-bucket.json',
});
const bucketName = 'attendance-bucket-autowhat';
const bucket = storage.bucket(bucketName);

function axiosConfig(url: string, method: string, data = '') {
  return {
    method,
    maxBodyLength: Infinity,
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  };
}

export async function uploadToBucket(url: string, fileName: string) {
  const downloadImageConfig = axiosConfig(url, 'get');
  const response = await axios({
    ...downloadImageConfig,
    responseType: 'stream',
  });

  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(blobStream);

    blobStream.on('error', (error: any) => {
      reject({
        status: 'failed',
        message: 'Failed to upload',
        error: error.message,
      });
    });

    blobStream.on('finish', async () => {
      try {
        const [url] = await blob.getSignedUrl({
          action: 'read',
          expires: '01-01-2030',
        });
        resolve({
          status: 'success',
          message: 'Uploaded the file successfully',
          url,
        });
      } catch (error: any) {
        reject({
          status: 'failed',
          message: `Uploaded the file successfully: ${fileName}, but public access is denied!`,
          error: error.message,
        });
      }
    });
  });
}

export async function uploadFileToBucket(filePath: string, fileName: string) {
  try {
    const stream = createReadStream(filePath);

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.pipe(blobStream);

      blobStream.on('error', (error: any) => {
        reject({
          status: 'failed',
          message: 'Failed to upload',
          error: error.message,
        });
      });

      blobStream.on('finish', async () => {
        try {
          const [url] = await blob.getSignedUrl({
            action: 'read',
            expires: '01-01-2030',
          });
          resolve({
            status: 'success',
            message: 'Uploaded the file successfully',
            url,
          });
        } catch (error: any) {
          reject({
            status: 'failed',
            message: `Uploaded the file successfully: ${fileName}, but public access is denied!`,
            error: error.message,
          });
        }
      });
    });
  } catch (error: any) {
    console.error(error);
  }
}

export async function uploadBase64ToBucket(
  base64String: string,
  fileName: string,
) {
  // Convert base64 to a buffer
  const buffer = Buffer.from(base64String, 'base64');

  // Create a file in the bucket
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.end(buffer);

    blobStream.on('error', (error: any) => {
      reject({
        status: 'failed',
        message: 'Failed to upload base64 image',
        error: error.message,
      });
    });

    blobStream.on('finish', async () => {
      try {
        // Generate a signed URL for the uploaded file
        const [url] = await blob.getSignedUrl({
          action: 'read',
          expires: '01-01-2030',
        });
        resolve({
          status: 'success',
          message: 'Uploaded the base64 image successfully',
          url,
        });
      } catch (error: any) {
        reject({
          status: 'failed',
          message: `Uploaded the base64 image successfully: ${fileName}, but public access is denied!`,
          error: error.message,
        });
      }
    });
  });
}

export async function uploadBrowserFileToBucket(file: { 
  buffer: Buffer; 
  name: string; 
  originalName?: string;
  type: string 
}) {
  const fileName = file.name;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.type,
  });

  // Upload the file
  blobStream.end(file.buffer);

  // Wait for the upload to complete
  await new Promise((resolve, reject) => {
    blobStream.on('finish', resolve);
    blobStream.on('error', reject);
  });

  const [url] = await blob.getSignedUrl({
    action: 'read',
    expires: '01-01-2030',
  });

  return { 
    url, 
    fileName, 
    type: file.type,
    originalName: file.originalName // Return the original filename if provided
  };
}
