import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      return NextResponse.json({
        success: true,
        authenticated: true,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in auth check API:', error);
    return NextResponse.json(
      { success: false, authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
