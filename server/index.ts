/**
 * Main Backend Server
 * Production-ready Express server with Socket.IO for real-time features
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import stationRoutes from './routes/stations';
import complaintRoutes from './routes/complaints';
import notificationRoutes from './routes/notifications';
import voiceRoutes from './routes/voice';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';
import os from 'os';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/voice', voiceRoutes);

// Initialize WebSocket
initializeSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '4000', 10);

/**
 * Get local network IP address
 */
function getLocalIpAddress(): string | null {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

httpServer.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📱 Network Access URLs:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  if (localIp) {
    console.log(`   Network:  http://${localIp}:${PORT}`);
    console.log(`\n   ✅ Scan QR codes from your phone using the Network URL\n`);
  }
});

// Make io accessible globally for emitting events from other modules
export { io };
