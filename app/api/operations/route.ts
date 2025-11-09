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

    let identifier = '';
    try {
      const decoded = Buffer.from(authCookie.value, 'base64').toString('utf8');
      identifier = decoded.split(':')[0]?.toLowerCase() || '';
    } catch { }

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Invalid auth token' },
        { status: 401 }
      );
    }

    // Find user by email or phone depending on identifier
    let user = null as any;
    if (identifier.includes('@')) {
      user = await usersCollection.findOne({ email: identifier, isActive: true });
    } else {
      const digits = String(identifier).replace(/\D/g, '');
      const phoneNum = Number(digits);
      if (Number.isFinite(phoneNum)) {
        user = await usersCollection.findOne({ phone: phoneNum, isActive: true });
      }
    }
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const role: string = (user as any).role || 'user';

    // Show all operations to every authenticated user
    const amountFilter: any = {};

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

    // Helper function
    const parseNumber = (value: any): number => {
      if (value === null || value === undefined || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // --- Define all input values safely ---
    const amount = parseNumber(body.amount);
    const engineHrs = parseNumber(body.engineHrs);
    const serviceKM = parseNumber(body.serviceKM);
    const spareWithoutTax = parseNumber(body.spareWithoutTax);
    const discountOnParts = parseNumber(body.discountOnParts);
    const spareWith5GSTValue = parseNumber(body.spareWith5GST);
    const spareWith18GSTValue = parseNumber(body.spareWith18GST);
    const spareWith28GSTValue = parseNumber(body.spareWith28GST);
    const labour = parseNumber(body.labour);
    const outsideLabour = parseNumber(body.outsideLabour);
    const discountLabour = parseNumber(body.discountLabour);

    // --- GST parsing ---
    const gstOnParts =
      body.gstOnParts === '18%'
        ? 0.18
        : body.gstOnParts === '28%'
          ? 0.28
          : body.gstOnParts === '5%'
            ? 0.05
            : 0;

    const gstOnLabour =
      body.gstOnLabour === '18%'
        ? 0.18
        : body.gstOnLabour === '28%'
          ? 0.28
          : body.gstOnLabour === '5%'
            ? 0.05
            : 0;

    // --- SPARE CALCULATIONS ---
    const spareDiscountAmount = spareWithoutTax * (discountOnParts / 100);
    const spareAfterDiscount = spareWithoutTax - spareDiscountAmount;
    const spareGSTAmount = spareAfterDiscount * gstOnParts;
    const spareWithGST = spareAfterDiscount + spareGSTAmount;

    const spare5AfterDiscount = spareWith5GSTValue - spareWith5GSTValue * (discountOnParts / 100);
    const spare18AfterDiscount = spareWith18GSTValue - spareWith18GSTValue * (discountOnParts / 100);
    const spare28AfterDiscount = spareWith28GSTValue - spareWith28GSTValue * (discountOnParts / 100);

    const spare5WithGST = spare5AfterDiscount * 1.05;
    const spare18WithGST = spare18AfterDiscount * 1.18;
    const spare28WithGST = spare28AfterDiscount * 1.28;

    // --- LABOUR CALCULATIONS ---
    const labourAfterDiscount = labour - labour * (discountLabour / 100);
    const labourGSTAmount = labourAfterDiscount * gstOnLabour;
    const labourWithGST = labourAfterDiscount + labourGSTAmount;

    // --- OUTSIDE LABOUR CALCULATIONS ---
    const outsideLabourDiscountAmount = outsideLabour * (discountLabour / 100);
    const outsideLabourAfterDiscount = outsideLabour - outsideLabourDiscountAmount;
    const outsideLabourGSTAmount = outsideLabourAfterDiscount * gstOnLabour;
    const outsideLabourWithGST = outsideLabourAfterDiscount + outsideLabourGSTAmount;

    // --- TOTALS ---
    const totalInvAmountPayable =
      spareWithGST +
      spare5WithGST +
      spare18WithGST +
      spare28WithGST +
      labourWithGST +
      outsideLabourWithGST;

    const totalAmountWithDiscountButWithoutTax =
      spareAfterDiscount +
      spare5AfterDiscount +
      spare18AfterDiscount +
      spare28AfterDiscount +
      labourAfterDiscount +
      outsideLabourAfterDiscount;

    // --- Create new operation ---
    const newOperation = {
      vehicleNumber,
      operationDate: body.operationDate || new Date(),
      status: 'pending',
      invoiceBill: body.invoiceBill || null,
      formType: body.formType || '',

      // Core Operation Details
      operationType: body.operationType,
      subPartName: body.subPartName || '',
      amount,
      description: body.description || '',

      // Common Fields
      dateSendToWS: body.dateSendToWS || '',
      workshop: body.workshop || '',
      complaints: body.complaints || '',
      actionTaken: body.actionTaken || '',
      vehReadyDateFromWS: body.vehReadyDateFromWS || '',
      invoiceNo: body.invoiceNo || '',
      invoiceDate: body.invoiceDate || '',

      // AC Maintenance Specific
      acUnit: body.acUnit || '',
      engineHrs,
      advisorNo: body.advisorNo || '',

      // Vehicle Maintenance Specific
      serviceKM,
      workOrderNo: body.workOrderNo || '',

      // Financial Fields
      spare: body.spare || '',
      spareWithoutTax,
      labour,
      outsideLabour,
      discountOnParts: body.discountOnParts || '',
      gstOnParts: body.gstOnParts || '',
      discountLabour,
      gstOnLabour: body.gstOnLabour || '',
      spareWith5GST: spareWith5GSTValue,
      spareWith18GST: spareWith18GSTValue,
      spareWith28GST: spareWith28GSTValue,

      // Calculated
      totalInvAmountPayable: totalInvAmountPayable.toFixed(2),
      totalAmountWithDiscountButWithoutTax: totalAmountWithDiscountButWithoutTax.toFixed(2),
      labourWithGST: labourWithGST.toFixed(2),

      // Other Fields
      remark: body.remark || '',
      jobType: body.jobType || '',
      amcNonAmc: body.amcNonAmc || '',

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