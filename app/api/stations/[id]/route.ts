import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

// GET /api/stations/[id] - Get single station
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const station = await prisma.station.findFirst({
      where: {
        OR: [
          { id: params.id },
          { qrCodeData: params.id },
        ],
        deletedAt: null,
      },
      include: {
        _count: {
          select: { complaints: true },
        },
      },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json(station);
  } catch (error: any) {
    console.error('Get station error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// PUT /api/stations/[id] - Update station
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, description, isActive } = body;

    const station = await prisma.station.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    const updated = await prisma.station.update({
      where: { id: params.id },
      data: {
        name: name || station.name,
        location: location !== undefined ? location : station.location,
        description: description !== undefined ? description : station.description,
        isActive: isActive !== undefined ? isActive : station.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update station error:', error);
    return NextResponse.json(
      { error: 'Failed to update station', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// DELETE /api/stations/[id] - Delete station
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const station = await prisma.station.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.station.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Station deleted successfully' });
  } catch (error: any) {
    console.error('Delete station error:', error);
    return NextResponse.json(
      { error: 'Failed to delete station', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
