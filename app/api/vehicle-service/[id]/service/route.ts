import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const database = await DatabaseServiceServer.getInstance();
    await database.addVehicleServiceItem(params.id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error adding vehicle service item:', error);
    return NextResponse.json({ error: 'Failed to add service item' }, { status: 500 });
  }
}


