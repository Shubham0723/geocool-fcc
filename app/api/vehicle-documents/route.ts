import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await DatabaseServiceServer.getInstance();
    const documents = await database.getVehicleDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching vehicle documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const database = await DatabaseServiceServer.getInstance();
    const document = await database.createVehicleDocument(body);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle document:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle document' },
      { status: 500 }
    );
  }
}
