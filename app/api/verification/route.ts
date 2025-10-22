import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const expiredOnly = searchParams.get('expired') === 'true';
    
    const db = await getDatabase();
    let query = {};
    
    if (expiredOnly) {
      query = { isExpired: true };
    }
    
    const documents = await db.collection('verification').find(query).toArray();
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    const document = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('verification').insertOne(document);
    const insertedDocument = { ...document, _id: result.insertedId };
    
    return NextResponse.json(insertedDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating verification document:', error);
    return NextResponse.json(
      { error: 'Failed to create verification document' },
      { status: 500 }
    );
  }
}
