import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    const db = await getDatabase();
    console.log('Database connected successfully');
    
    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
