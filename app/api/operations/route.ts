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

    // Build amount filter based on role using totalInvAmountPayable
    let amountFilter: any = {};
    if (role === 'user') {
      amountFilter = { totalInvAmountPayable: { $gte: 0, $lte: 2000 } };
    } else if (role === 'admin') {
      amountFilter = { totalInvAmountPayable: { $gt: 2000, $lte: 5000 } };
    } else if (role === 'superadmin') {
      amountFilter = { totalInvAmountPayable: { $gt: 5000 } };
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
        vehicleNumber: operation.vehicleNumber || '--',
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

    // Helper function to convert string to number safely
    const parseNumber = (value: any): number => {
      if (value === null || value === undefined || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Parse numeric fields
    const amount = parseNumber(body.amount);
    const spareWithoutTax = parseNumber(body.spareWithoutTax);
    const labour = parseNumber(body.labour);
    const outsideLabour = parseNumber(body.outsideLabour);
    const discountLabour = parseNumber(body.discountLabour);
    const engineHrs = parseNumber(body.engineHrs);
    const serviceKM = parseNumber(body.serviceKM);

    // Calculate GST and totals
    const spareRate = body.spare === '18%' ? 0.18 : body.spare === '28%' ? 0.28 : 0;
    const discountOnPartsRate = body.discountOnParts === '18%' ? 0.18 : body.discountOnParts === '28%' ? 0.28 : 0;
    const gstOnPartsRate = body.gstOnParts === '18%' ? 0.18 : body.gstOnParts === '28%' ? 0.28 : 0;
    const gstOnLabourRate = body.gstOnLabour === '18%' ? 0.18 : body.gstOnLabour === '28%' ? 0.28 : 0;

    // Calculate spare: First apply discount, then add GST on discounted amount
    const spareDiscountAmount = spareWithoutTax * discountOnPartsRate;
    const spareAfterDiscount = spareWithoutTax - spareDiscountAmount;
    const spareGSTAmount = spareAfterDiscount * gstOnPartsRate;
    const spareWithGST = spareAfterDiscount + spareGSTAmount;
    
    // Calculate labour: First apply discount as percentage, then add GST on discounted amount
    const labourDiscountAmount = labour * (discountLabour / 100);
    const labourAfterDiscount = labour - labourDiscountAmount;
    const labourGSTAmount = labourAfterDiscount * gstOnLabourRate;
    const labourWithGST = labourAfterDiscount + labourGSTAmount;
    
    // Calculate totals
    const totalWithGST = amount + spareWithGST + labourWithGST + outsideLabour;
    const totalWithoutGST = amount + spareWithoutTax + labour + outsideLabour;
    const totalAmountWithDiscountButWithoutTax = spareAfterDiscount + labourAfterDiscount;

    // Create new operation with all form fields according to new schema
    const newOperation = {
      vehicleNumber: vehicleNumber,
      operationDate: body.operationDate || new Date(),
      status: 'pending',
      invoiceBill: body.invoiceBill || null,
      formType: body.formType || '',
      
      // Core Operation Details
      operationType: body.operationType,
      amount: amount,
      description: body.description || '',
      
      // Common Fields for both AC Maintenance and Vehicle Maintenance
      dateSendToWS: body.dateSendToWS || '',
      workshop: body.workshop || '',
      complaints: body.complaints || '',
      actionTaken: body.actionTaken || '',
      vehReadyDateFromWS: body.vehReadyDateFromWS || '',
      invoiceNo: body.invoiceNo || '',
      invoiceDate: body.invoiceDate || '',
      
      // AC Maintenance Specific Fields
      acUnit: body.acUnit || '',
      engineHrs: engineHrs,
      advisorNo: body.advisorNo || '',
      
      // Vehicle Maintenance Specific Fields
      serviceKM: serviceKM,
      workOrderNo: body.workOrderNo || '',
      
      // Financial Details
      spare: body.spare || '',
      spareWithoutTax: spareWithoutTax,
      labour: labour,
      outsideLabour: outsideLabour,
      discountOnParts: body.discountOnParts || '',
      gstOnParts: body.gstOnParts || '',
      discountLabour: discountLabour,
      gstOnLabour: body.gstOnLabour || '',
      
      // Calculated Fields
      totalInvAmountPayable: totalWithGST,
      totalAmountWithDiscountButWithoutTax: totalAmountWithDiscountButWithoutTax,
      labourWithGST: labourWithGST,
      
      // Additional Fields
      remark: body.remark || '',
      jobType: body.jobType || '',
      
      // System Fields
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