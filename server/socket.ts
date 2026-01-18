/**
 * WebSocket Server Configuration
 * Handles real-time notifications and updates for admin dashboard
 */

import { Server } from 'socket.io';

let io: Server;

export function initializeSocket(socketServer: Server) {
  io = socketServer;

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join admin room for notifications
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`👤 Admin joined room: ${socket.id}`);
    });

    // Leave admin room
    socket.on('leave-admin', () => {
      socket.leave('admin-room');
      console.log(`👋 Admin left room: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit new complaint notification to all admins
 */
export function emitNewComplaint(complaint: any) {
  if (io) {
    io.to('admin-room').emit('new-complaint', complaint);
  }
}

/**
 * Emit notification to all admins
 */
export function emitNotification(notification: any) {
  if (io) {
    io.to('admin-room').emit('notification', notification);
  }
}

/**
 * Emit station update to all admins
 */
export function emitStationUpdate(station: any) {
  if (io) {
    io.to('admin-room').emit('station-update', station);
  }
}

/**
 * Emit complaint status update
 */
export function emitComplaintUpdate(complaint: any) {
  if (io) {
    io.to('admin-room').emit('complaint-update', complaint);
  }
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
