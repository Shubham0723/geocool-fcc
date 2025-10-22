import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;
    const documents = await request.json();

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, message: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('vehicles');

    // Update the vehicle with new document URLs
    const result = await collection.updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          ...documents,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documents updated successfully',
    });
  } catch (error) {
    console.error('Error updating vehicle documents:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}