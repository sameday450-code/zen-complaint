/**
 * Complaint Routes
 * Handles complaint submission and management
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/db';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { complaintValidation, validate } from '../middleware/validation';
import { complaintLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { emitNewComplaint, emitNotification, emitComplaintUpdate } from '../socket';
import { uploadToS3 } from '../lib/storage';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 
    'image/jpeg,image/png,image/jpg,video/mp4,video/quicktime').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

/**
 * GET /api/complaints
 * Get all complaints (admin only)
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { stationId, status, page = '1', limit = '20' } = req.query;

    const where: any = { deletedAt: null };
    if (stationId) where.stationId = stationId;
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          station: true,
          mediaFiles: true,
          voiceCall: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      complaints,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  })
);

/**
 * GET /api/complaints/:id
 * Get single complaint
 */
router.get(
  '/:id',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: { id, deletedAt: null },
      include: {
        station: true,
        mediaFiles: true,
        voiceCall: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  })
);

/**
 * POST /api/complaints
 * Submit new complaint (customer-facing)
 */
router.post(
  '/',
  complaintLimiter,
  upload.array('media', 5), // Max 5 files
  complaintValidation,
  validate,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { stationId, customerName, customerPhone, category, description } = req.body;
    const files = req.files as Express.Multer.File[];

    // Verify station exists and is active
    const station = await prisma.station.findFirst({
      where: { id: stationId, isActive: true, deletedAt: null },
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found or inactive' });
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        stationId,
        customerName,
        customerPhone,
        category,
        description,
        submissionMethod: 'qr_code',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'pending',
        priority: 'normal',
      },
      include: {
        station: true,
      },
    });

    // Handle file uploads
    if (files && files.length > 0) {
      const mediaFiles = await Promise.all(
        files.map(async (file) => {
          // Upload to S3 or keep locally
          const fileUrl = await uploadToS3(file);

          return prisma.mediaFile.create({
            data: {
              complaintId: complaint.id,
              fileName: file.filename,
              originalName: file.originalname,
              fileType: file.mimetype,
              fileSize: file.size,
              fileUrl: fileUrl || `/uploads/${file.filename}`,
              storageKey: file.filename,
            },
          });
        })
      );

      (complaint as any).mediaFiles = mediaFiles;
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        complaintId: complaint.id,
        title: 'New Complaint Received',
        message: `New complaint from ${customerName} at ${station.name}`,
        type: 'new_complaint',
      },
    });

    // Emit real-time updates
    emitNewComplaint(complaint);
    emitNotification(notification);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
    });
  })
);

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status (admin only)
 */
router.patch(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        station: true,
        mediaFiles: true,
      },
    });

    emitComplaintUpdate(complaint);

    res.json(complaint);
  })
);

/**
 * DELETE /api/complaints/:id
 * Soft delete complaint (admin only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.complaint.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Complaint deleted successfully' });
  })
);

export default router;
