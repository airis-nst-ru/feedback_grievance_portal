import { NextResponse } from "next/server";
import prisma from "@/lib/dbInstance";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

function generateTrackingId(type: string): string {
  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  const prefix = type === "grievance" ? "GRV-" : "FB-";
  return `${prefix}${randomChars}`;
}

export async function POST(request: Request) {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  try {
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: "Missing type or content" },
        { status: 400 }
      );
    }

    if (type !== "grievance" && type !== "feedback") {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    const trackingId = generateTrackingId(type);

    await prisma.submission.create({
      data: {
        type,
        content,
        trackingId,
        status: "pending",
      },
    });

    // Notify admin emails (non-blocking)
    prisma.adminNotification.findMany().then(async (admins) => {
      if (admins.length > 0) {
        await sendMail({
          to: admins.map((a) => a.email),
          subject: `New ${type} submitted — ${trackingId}`,
          html: `<p>A new <strong>${type}</strong> has been submitted.</p><p><strong>Tracking ID:</strong> ${trackingId}</p><p><strong>Content:</strong> ${content}</p>`,
        });
      }
    }).catch((err) => console.error('[Mailer] Notification error:', err));

    return NextResponse.json({
      success: true,
      trackingId,
      message: `Your submission has been received. Use this ID to check status: ${trackingId}`,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}