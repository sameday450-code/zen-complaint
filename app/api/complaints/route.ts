import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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

// GET /api/complaints - Get all complaints
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const status = searchParams.get('status');

    const complaints = await prisma.complaint.findMany({
      where: {
        deletedAt: null,
        ...(stationId && { stationId }),
        ...(status && { status }),
      },
      include: {
        station: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        mediaFiles: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints, total: complaints.length });
  } catch (error: any) {
    console.error('Get complaints error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const stationId = formData.get('stationId') as string;
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const submissionMethod = formData.get('submissionMethod') as string || 'web';
    
    // Validation
    if (!stationId || !customerName || !customerPhone || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify station exists
    const station = await prisma.station.findFirst({
      where: {
        OR: [
          { id: stationId },
          { qrCodeData: stationId },
        ],
        deletedAt: null,
      },
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        stationId: station.id,
        customerName,
        customerPhone,
        category,
        description,
        submissionMethod,
        ipAddress,
        userAgent,
        status: 'pending',
        priority: 'normal',
      },
      include: {
        station: true,
      },
    });

    // Handle file uploads
    const files = formData.getAll('files') as File[];
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `${randomUUID()}-${file.name}`;
          const uploadDir = join(process.cwd(), 'public', 'uploads');
          const filePath = join(uploadDir, fileName);
          
          // Note: In production, you should use cloud storage (S3, Cloudflare R2, etc.)
          try {
            await writeFile(filePath, buffer);
            
            await prisma.mediaFile.create({
              data: {
                complaintId: complaint.id,
                fileName,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: `/uploads/${fileName}`,
                storageKey: fileName,
              },
            });
          } catch (fileError) {
            console.error('File upload error:', fileError);
            // Continue even if file upload fails
          }
        }
      }
    }

    // Create notification
    await prisma.notification.create({
      data: {
        complaintId: complaint.id,
        title: 'New Complaint Received',
        message: `New complaint from ${customerName} at ${station.name}`,
        type: 'new_complaint',
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    console.error('Create complaint error:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
