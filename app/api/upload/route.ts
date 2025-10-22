import { NextRequest, NextResponse } from 'next/server';
import { uploadBrowserFileToBucket } from '@/lib/bucket';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const vehicleNumber = formData.get('vehicleNumber') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType || !vehicleNumber) {
      return NextResponse.json(
        { error: 'Missing documentType or vehicleNumber' },
        { status: 400 }
      );
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileName = `${vehicleNumber}_${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    
    const fileData = {
      buffer,
      name: fileName,
      originalName: file.name,
      type: file.type,
    };

    const result = await uploadBrowserFileToBucket(fileData);
    
    if (result.url) {
      return NextResponse.json({
        success: true,
        url: result.url,
        fileName: result.fileName,
        message: `${documentType.toUpperCase()} document uploaded successfully`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
