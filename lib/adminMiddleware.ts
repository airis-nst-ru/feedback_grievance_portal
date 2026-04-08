/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function withAuth(handler: (req: NextRequest, context?: { params: Promise<{ [key: string]: string }> }) => Promise<NextResponse>) {
  return (req: NextRequest, context?: { params: Promise<{ [key: string]: string }> }) => {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token.startsWith('admin-token-')) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return handler(req as any, context) as any;
  };
}