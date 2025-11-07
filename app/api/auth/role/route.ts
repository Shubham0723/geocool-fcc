import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

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
    } catch {}

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Invalid auth token' },
        { status: 401 }
      );
    }

    let user: any = null;
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
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}


