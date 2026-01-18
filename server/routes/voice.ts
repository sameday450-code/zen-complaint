/**
 * Voice Call Routes
 * Handles ElevenLabs AI voice assistant integration
 */

import express from 'express';
import prisma from '../lib/db';
import { voiceLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { emitNewComplaint, emitNotification } from '../socket';
import { handleVoiceCall, processVoiceComplaint } from '../lib/elevenlabs';

const router = express.Router();

/**
 * POST /api/voice/initiate
 * Initiate a voice call for complaint submission
 */
router.post(
  '/initiate',
  voiceLimiter,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { phoneNumber, stationId } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Verify station if provided
    if (stationId) {
      const station = await prisma.station.findFirst({
        where: { id: stationId, isActive: true, deletedAt: null },
      });

      if (!station) {
        return res.status(404).json({ error: 'Station not found' });
      }
    }

    // Create initial complaint record
    const complaint = await prisma.complaint.create({
      data: {
        stationId: stationId || '',
        customerName: 'Voice Call - Pending',
        customerPhone: phoneNumber,
        category: 'Voice Submission',
        description: 'Complaint being collected via voice call...',
        submissionMethod: 'voice_call',
        status: 'pending',
        ipAddress: req.ip,
      },
    });

    // Create voice call record
    const voiceCall = await prisma.voiceCall.create({
      data: {
        complaintId: complaint.id,
        phoneNumber,
        status: 'initiated',
      },
    });

    // Initiate the actual voice call (implementation depends on Twilio/ElevenLabs integration)
    try {
      const callResult = await handleVoiceCall(phoneNumber, complaint.id);
      
      await prisma.voiceCall.update({
        where: { id: voiceCall.id },
        data: {
          callSid: callResult.callSid,
          status: 'in-progress',
        },
      });

      res.status(201).json({
        message: 'Voice call initiated',
        complaintId: complaint.id,
        callId: voiceCall.id,
      });
    } catch (error: any) {
      await prisma.voiceCall.update({
        where: { id: voiceCall.id },
        data: { status: 'failed' },
      });

      res.status(500).json({ error: 'Failed to initiate voice call' });
    }
  })
);

/**
 * POST /api/voice/webhook
 * Webhook endpoint for Twilio/ElevenLabs callbacks
 */
router.post(
  '/webhook',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { callSid, complaintId, transcription, status } = req.body;

    // Find voice call
    const voiceCall = await prisma.voiceCall.findFirst({
      where: { callSid },
    });

    if (!voiceCall) {
      return res.status(404).json({ error: 'Voice call not found' });
    }

    // Process the voice data and update complaint
    if (transcription && status === 'completed') {
      const processedData = await processVoiceComplaint(transcription);

      // Update complaint with extracted information
      const complaint = await prisma.complaint.update({
        where: { id: voiceCall.complaintId },
        data: {
          customerName: processedData.customerName || 'Voice Caller',
          category: processedData.category || 'General',
          description: processedData.description || transcription,
          stationId: processedData.stationId || undefined,
        },
        include: {
          station: true,
        },
      });

      // Update voice call
      await prisma.voiceCall.update({
        where: { id: voiceCall.id },
        data: {
          transcription,
          status: 'completed',
          completedAt: new Date(),
          voiceData: processedData,
        },
      });

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          complaintId: complaint.id,
          title: 'New Voice Complaint',
          message: `Voice complaint received from ${complaint.customerPhone}`,
          type: 'new_complaint',
        },
      });

      // Emit real-time updates
      emitNewComplaint(complaint);
      emitNotification(notification);
    } else {
      // Update voice call status
      await prisma.voiceCall.update({
        where: { id: voiceCall.id },
        data: { status },
      });
    }

    res.json({ message: 'Webhook processed' });
  })
);

/**
 * GET /api/voice/:id
 * Get voice call details
 */
router.get(
  '/:id',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const voiceCall = await prisma.voiceCall.findUnique({
      where: { id },
      include: {
        complaint: {
          include: {
            station: true,
          },
        },
      },
    });

    if (!voiceCall) {
      return res.status(404).json({ error: 'Voice call not found' });
    }

    res.json(voiceCall);
  })
);

export default router;
