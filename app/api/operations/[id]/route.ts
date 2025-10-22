import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const operationId = params.id;
    const { status } = await request.json();

    if (!operationId) {
      return NextResponse.json(
        { success: false, message: 'Operation ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const usersCollection = db.collection('users');

    // Get user email from auth cookie
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Decode cookie to extract email (stored as base64 `${email}:${timestamp}`)
    let emailFromCookie = '';
    try {
      const decoded = Buffer.from(authToken.value, 'base64').toString('utf8');
      emailFromCookie = decoded.split(':')[0]?.toLowerCase() || '';
    } catch {}


    
    if (!emailFromCookie) {
      return NextResponse.json(
        { success: false, message: 'Invalid auth token' },
        { status: 401 }
      );
    }

    // Get user by email
    const user = await usersCollection.findOne({ 
      email: emailFromCookie,
      isActive: true 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // First, get the operation to check if user has access to it
    const operation = await operationsCollection.findOne({
      _id: new ObjectId(operationId)
    });

    if (!operation) {
      return NextResponse.json(
        { success: false, message: 'Operation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this operation based on amount and role
    const userRole: string = (user as any).role || 'user';
    let hasAccess = false;

    switch (userRole) {
      case 'user':
        hasAccess = operation.amount <= 2000;
        break;
      case 'admin':
        hasAccess = operation.amount <= 5000;
        break;
      case 'superadmin':
        hasAccess = true; // Can access all operations
        break;
      default:
        hasAccess = operation.amount <= 2000;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Insufficient permissions for this operation.' },
        { status: 403 }
      );
    }

    // Update the operation status
    const result = await operationsCollection.updateOne(
      { _id: new ObjectId(operationId) },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Operation not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No changes made to the operation' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Operation status updated successfully',
      data: {
        operationId,
        status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating operation status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
