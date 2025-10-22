import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceServer } from '@/lib/database-server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await DatabaseServiceServer.getInstance();
    const tickets = await database.getTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received ticket data:', body);
    
    const database = await DatabaseServiceServer.getInstance();
    
    // Convert vehicleNumber to vehicleId if needed
    // For now, we'll store the vehicleNumber directly in the ticket
    const ticketData = {
      vehicleId: body.vehicleNumber, // Store the vehicle number as vehicleId for now
      issueType: body.issueType,
      description: body.description,
      status: body.status || 'open',
      priority: body.priority || 'medium',
      reportedBy: body.reportedBy || 'User',
      ticketNumber: `TKT${Date.now().toString().slice(-6)}`, // Generate ticket number
    };
    
    console.log('Creating ticket with data:', ticketData);
    const ticket = await database.createTicket(ticketData);
    console.log('Ticket created successfully:', ticket);
    
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
