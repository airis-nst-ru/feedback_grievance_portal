import { NextRequest, NextResponse } from 'next/server';
import dbInstance from '@/lib/dbInstance';
import { withAuth } from '@/lib/adminMiddleware';

export const runtime = "nodejs";

async function getSubmission(req: NextRequest, context?: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context!.params;

    const submission = await dbInstance.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    const replies = await dbInstance.reply.findMany({
      where: { submissionId: id },
    });

    return NextResponse.json({
      success: true,
      data: { ...submission, replies },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSubmission as any);