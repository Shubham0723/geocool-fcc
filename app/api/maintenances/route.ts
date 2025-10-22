import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await DatabaseServiceServer.getInstance();
    const maintenances = await database.getMaintenances();
    return NextResponse.json(maintenances);
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const database = await DatabaseServiceServer.getInstance();
    const maintenance = await database.createMaintenance(body);
    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance' },
      { status: 500 }
    );
  }
}
