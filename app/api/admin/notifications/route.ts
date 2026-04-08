import { NextRequest, NextResponse } from 'next/server';
import dbInstance from '@/lib/dbInstance';
import { withAuth } from '@/lib/adminMiddleware';

export const runtime = "nodejs";

async function getNotifications(req: NextRequest) {
  try {
    const notifications = await dbInstance.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

async function addNotification(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    const notification = await dbInstance.adminNotification.create({
      data: { email: email.trim().toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to add notification' },
      { status: 500 }
    );
  }
}

async function removeNotification(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbInstance.adminNotification.delete({
      where: { email: email.trim().toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification removed',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to remove notification' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getNotifications as any);
export const POST = withAuth(addNotification as any);
export const DELETE = withAuth(removeNotification as any);