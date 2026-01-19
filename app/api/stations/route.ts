import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/stations - Get all stations
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stations = await prisma.station.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { complaints: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(stations);
  } catch (error: any) {
    console.error('Get stations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// POST /api/stations - Create a new station
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Station name is required' }, { status: 400 });
    }

    // Generate unique QR code data
    const qrCodeData = `station-${randomUUID()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const complaintUrl = `${baseUrl}/report/${qrCodeData}`;

    // Generate QR code
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(complaintUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
    }

    const station = await prisma.station.create({
      data: {
        name,
        location: location || null,
        description: description || null,
        qrCodeData,
        qrCodeUrl,
        isActive: true,
      },
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error: any) {
    console.error('Create station error:', error);
    return NextResponse.json(
      { error: 'Failed to create station', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
