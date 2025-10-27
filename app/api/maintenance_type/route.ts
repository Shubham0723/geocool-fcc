import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const result = await db.collection('maintenance_type').find({}).toArray();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDatabase();
    const { Type_name } = await req.json();
    if (!Type_name) {
      return NextResponse.json({ error: 'Type_name is required' }, { status: 400 });
    }
    const exists = await db.collection('maintenance_type').findOne({ Type_name });
    if (exists) {
      return NextResponse.json({ error: 'Type already exists' }, { status: 400 });
    }
    const res = await db.collection('maintenance_type').insertOne({ Type_name });
    return NextResponse.json({ success: true, _id: res.insertedId, Type_name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add maintenance type' }, { status: 500 });
  }
}
