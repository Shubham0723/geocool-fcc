import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { uploadBrowserFileToBucket } from '@/lib/bucket';

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

    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be pending, approved, rejected, or completed' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const usersCollection = db.collection('users');

    // Get user identifier (email or phone) from auth cookie
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Decode cookie to extract identifier (stored as base64 `${emailOrPhone}:${timestamp}`)
    let identifierFromCookie = '';
    try {
      const decoded = Buffer.from(authToken.value, 'base64').toString('utf8');
      identifierFromCookie = decoded.split(':')[0]?.toLowerCase() || '';
    } catch { }




    if (!identifierFromCookie) {
      return NextResponse.json(
        { success: false, message: 'Invalid auth token' },
        { status: 401 }
      );
    }

    // Get user by email (if identifier contains '@') or by phone (digits only)
    let user = null as any;
    if (identifierFromCookie.includes('@')) {
      user = await usersCollection.findOne({
        email: identifierFromCookie,
        isActive: true
      });
    } else {
      const digits = String(identifierFromCookie).replace(/\D/g, '');
      const phoneNum = Number(digits);
      if (Number.isFinite(phoneNum)) {
        user = await usersCollection.findOne({
          phone: phoneNum,
          isActive: true
        });
      }
    }

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

    // Check role-based permission using Total Inv Amount Payable
    const userRole: string = ((user as any).role || 'user').toLowerCase();
    const payable: number = Number(
      operation.totalInvAmountPayable ?? operation.amount ?? 0
    );

    let hasAccess = false;
    if (userRole === 'user') {
      // >0 and up to 2000
      hasAccess = payable > 0 && payable <= 2000;
    } else if (userRole === 'admin') {
      // >2000 and up to 5000
      hasAccess = payable > 0 && payable <= 5000;
    } else if (userRole === 'superadmin' || userRole === 'super-admin') {
      // greater than 5000
      hasAccess = payable > 5000;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'You are not allowed to update' },
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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const operationId = params.id;
    if (!operationId) {
      return NextResponse.json(
        { success: false, message: 'Operation ID is required' },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileData = {
      buffer,
      name: `invoiceBill_${operationId}_${Date.now()}_${(file as File).name}`,
      originalName: (file as File).name,
      type: (file as File).type || 'application/octet-stream',
    };
    const uploadRes = await uploadBrowserFileToBucket(fileData);
    if (!uploadRes || !uploadRes.url) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload file to bucket' },
        { status: 500 }
      );
    }
    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const updateRes = await operationsCollection.updateOne(
      { _id: new ObjectId(operationId) },
      { $set: { invoiceBill: uploadRes.url, updatedAt: new Date() } }
    );
    if (!updateRes.matchedCount) {
      return NextResponse.json(
        { success: false, message: 'Operation not found' },
        { status: 404 }
      );
    }
    const updatedOp = await operationsCollection.findOne({ _id: new ObjectId(operationId) });
    return NextResponse.json({ success: true, invoiceBill: uploadRes.url, operation: updatedOp });
  } catch (err) {
    console.error('Error uploading invoice bill:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const operationId = params.id;
    if (!operationId) {
      return NextResponse.json(
        { success: false, message: 'Operation ID is required' },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const operationsCollection = db.collection('operations');
    const operation = await operationsCollection.findOne({ _id: new ObjectId(operationId) });
    if (!operation) {
      return NextResponse.json(
        { success: false, message: 'Operation not found' },
        { status: 404 }
      );
    }
    // Optionally remove sensitive fields
    return NextResponse.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch operation' },
      { status: 500 }
    );
  }
}
