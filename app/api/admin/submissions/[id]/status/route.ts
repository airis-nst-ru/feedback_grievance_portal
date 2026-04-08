import { NextRequest, NextResponse } from 'next/server';
import dbInstance from '@/lib/dbInstance';
import { withAuth } from '@/lib/adminMiddleware';

async function updateStatus(req: NextRequest, context?: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'reviewing', 'resolved'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const submission = await dbInstance.submission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(updateStatus as any);