import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = "admin-token-" + Date.now();
            return NextResponse.json({
                success: true,
                token,
                message: "Login successful"
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials"
            }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Admin auth endpoint"
    });
}