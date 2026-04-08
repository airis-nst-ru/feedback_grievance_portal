import { NextRequest, NextResponse } from 'next/server';
import dbInstance from '@/lib/dbInstance';
import { withAuth } from '@/lib/adminMiddleware';

async function getSubmissions(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};

    if (status && ['pending', 'reviewing', 'resolved'].includes(status)) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const submissions = await dbInstance.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const submissionIds = submissions.map(s => s.id);
    const allReplies = await dbInstance.reply.findMany({
      where: { submissionId: { in: submissionIds } },
    });

    const submissionsWithReplies = submissions.map(s => ({
      ...s,
      replies: allReplies.filter(r => r.submissionId === s.id),
    }));

    return NextResponse.json({
      success: true,
      data: submissionsWithReplies,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSubmissions as any);