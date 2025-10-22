import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const usersCollection = db.collection('users');

    // Read auth cookie and extract email (base64 of `${email}:${timestamp}`)
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let email = '';
    try {
      const decoded = Buffer.from(authCookie.value, 'base64').toString('utf8');
      email = decoded.split(':')[0]?.toLowerCase() || '';
    } catch {}

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Invalid auth token' },
        { status: 401 }
      );
    }

    // Find user and role by email
    const user = await usersCollection.findOne({ email, isActive: true });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const role: string = (user as any).role || 'user';

    // Build amount filter based on role
    let amountFilter: any = {};
    if (role === 'user') {
      amountFilter = { amount: { $gte: 0, $lte: 2000 } };
    } else if (role === 'admin') {
      amountFilter = { amount: { $gt: 2000, $lte: 5000 } };
    } else if (role === 'superadmin') {
      amountFilter = { amount: { $gt: 5000 } };
    }

    const operations = await operationsCollection
      .find(amountFilter)
      .sort({ createdAt: -1 })
      .toArray();

    const serializedOperations = operations.map((operation) => {
      const { vehicleId, ...operationWithoutVehicleId } = operation;
      return {
        ...operationWithoutVehicleId,
        _id: operation._id.toString(),
        vehicleNumber: operation.vehicleNumber || 'N/A',
      };
    });

    return NextResponse.json(serializedOperations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch operations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const vehiclesCollection = db.collection('vehicles');

    // Convert vehicleId to vehicleNumber
    let vehicleNumber = body.vehicleNumber;
    if (body.vehicleId && !vehicleNumber) {
      const vehicle = await vehiclesCollection.findOne({ _id: body.vehicleId });
      if (vehicle) {
        vehicleNumber = vehicle.vehicleNumber;
      } else {
        return NextResponse.json(
          { success: false, message: 'Vehicle not found' },
          { status: 404 }
        );
      }
    }

    // Create new operation with vehicleNumber instead of vehicleId
    const newOperation = {
      vehicleNumber: vehicleNumber,
      operationType: body.operationType,
      amount: body.amount,
      description: body.description,
      operationDate: body.operationDate || new Date(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await operationsCollection.insertOne(newOperation);

    return NextResponse.json({
      success: true,
      message: 'Operation created successfully',
      data: {
        _id: result.insertedId.toString(),
        ...newOperation,
      },
    });
  } catch (error) {
    console.error('Error creating operation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create operation' },
      { status: 500 }
    );
  }
}