import { NextResponse } from "next/server";
import prisma from "@/lib/dbInstance";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    const submission = await prisma.submission.findUnique({
      where: { trackingId },
      select: {
        id: true,
        type: true,
        status: true,
        content: true,
        createdAt: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    const replies = await prisma.reply.findMany({
      where: { submissionId: submission.id },
      select: {
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        type: submission.type,
        status: submission.status,
        content: submission.content,
        createdAt: submission.createdAt,
        replies,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}