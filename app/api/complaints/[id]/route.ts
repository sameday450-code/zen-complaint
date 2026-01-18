import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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

// GET /api/complaints/[id] - Get single complaint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        station: true,
        mediaFiles: true,
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Get complaint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaint', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// PUT /api/complaints/[id] - Update complaint status
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
    const { status, priority } = body;

    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updated = await prisma.complaint.update({
      where: { id: params.id },
      data: {
        status: status || complaint.status,
        priority: priority || complaint.priority,
        resolvedAt: status === 'resolved' ? new Date() : complaint.resolvedAt,
      },
      include: {
        station: true,
        mediaFiles: true,
      },
    });

    // Create notification for status change
    if (status && status !== complaint.status) {
      await prisma.notification.create({
        data: {
          complaintId: updated.id,
          title: 'Complaint Status Updated',
          message: `Complaint #${updated.id.substring(0, 8)} status changed to ${status}`,
          type: 'status_change',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update complaint error:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// DELETE /api/complaints/[id] - Delete complaint
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.complaint.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error: any) {
    console.error('Delete complaint error:', error);
    return NextResponse.json(
      { error: 'Failed to delete complaint', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
