/**
 * Station Routes
 * Handles station CRUD operations and QR code generation
 */

import express from 'express';
import QRCode from 'qrcode';
import prisma from '../lib/db';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { stationValidation, validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { emitStationUpdate } from '../socket';
import path from 'path';
import fs from 'fs';
import os from 'os';

const router = express.Router();

/**
 * Get local network IP address for QR code generation
 * Returns local IP for dev environment, falls back to env var for production
 */
function getBaseUrl(): string {
  // If NEXT_PUBLIC_API_URL is set, use it (production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // For local development, detect network IP
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        const port = process.env.PORT || '3000';
        return `http://${iface.address}:${port}`;
      }
    }
  }

  // Fallback to localhost
  return 'http://localhost:3000';
}

/**
 * GET /api/stations
 * Get all active stations
 */
router.get(
  '/',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const stations = await prisma.station.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { complaints: true },
        },
      },
    });

    res.json(stations);
  })
);

/**
 * GET /api/stations/:id
 * Get single station by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const station = await prisma.station.findFirst({
      where: { id, deletedAt: null },
      include: {
        complaints: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  })
);

/**
 * GET /api/stations/qr/:qrCodeData
 * Get station by QR code data
 */
router.get(
  '/qr/:qrCodeData',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { qrCodeData } = req.params;

    const station = await prisma.station.findFirst({
      where: { qrCodeData, deletedAt: null, isActive: true },
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  })
);

/**
 * POST /api/stations
 * Create new station with QR code
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  stationValidation,
  validate,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { name, location, description } = req.body;

    // Generate unique QR code data
    const qrCodeData = `STATION-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create station first
    const station = await prisma.station.create({
      data: {
        name,
        location,
        description,
        qrCodeData,
      },
    });

    // Generate QR code image
    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }

    const qrCodeFileName = `${station.id}.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFileName);
    
    // QR code contains the complaint form URL with station ID
    // Use local network IP for dev, production URL otherwise
    const baseUrl = getBaseUrl();
    const complaintFormUrl = `${baseUrl}/report/${station.id}`;
    
    console.log(`📱 QR Code generated for station "${name}" at: ${complaintFormUrl}`);
    
    await QRCode.toFile(qrCodePath, complaintFormUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Update station with QR code URL
    const updatedStation = await prisma.station.update({
      where: { id: station.id },
      data: {
        qrCodeUrl: `/qrcodes/${qrCodeFileName}`,
      },
    });

    // Emit real-time update
    emitStationUpdate({ action: 'created', station: updatedStation });

    res.status(201).json(updatedStation);
  })
);

/**
 * PUT /api/stations/:id
 * Update station
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  stationValidation,
  validate,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { name, location, description, isActive } = req.body;

    const station = await prisma.station.update({
      where: { id },
      data: {
        name,
        location,
        description,
        isActive,
      },
    });

    emitStationUpdate({ action: 'updated', station });

    res.json(station);
  })
);

/**
 * DELETE /api/stations/:id
 * Soft delete station
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const station = await prisma.station.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    emitStationUpdate({ action: 'deleted', station });

    res.json({ message: 'Station deleted successfully' });
  })
);

export default router;
