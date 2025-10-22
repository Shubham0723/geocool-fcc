import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const database = await DatabaseServiceServer.getInstance();
    const ticket = await database.updateTicket(params.id, body);
    
    if (ticket) {
      return NextResponse.json(ticket);
    } else {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const database = await DatabaseServiceServer.getInstance();
    const success = await database.deleteTicket(params.id);
    
    if (success) {
      return NextResponse.json({ message: 'Ticket deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
