import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await DatabaseServiceServer.getInstance();
    const items = await database.getVehicleServiceSchedules();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching vehicle services:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const database = await DatabaseServiceServer.getInstance();
    const created = await database.createVehicleService(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle service:', error);
    return NextResponse.json({ error: 'Failed to create vehicle service' }, { status: 500 });
  }
}


