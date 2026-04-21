import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: "ok",
        version: process.version,
        message: "Server is running on Node.js"
    });
}
