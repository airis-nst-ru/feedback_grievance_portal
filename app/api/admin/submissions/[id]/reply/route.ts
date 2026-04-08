import { NextRequest, NextResponse } from 'next/server';
import dbInstance from '@/lib/dbInstance';
import { withAuth } from '@/lib/adminMiddleware';

export const runtime = "nodejs";

async function createReply(req: NextRequest, context?: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    const submission = await dbInstance.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    const reply = await dbInstance.reply.create({
      data: {
        content: content.trim(),
        submissionId: id,
      },
    });

    return NextResponse.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createReply as any);