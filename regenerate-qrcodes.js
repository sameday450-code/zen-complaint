/**
 * Regenerate QR codes for existing stations
 * Run this after setting up network access to update QR codes with your network IP
 * 
 * Usage: node regenerate-qrcodes.js
 */

const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const os = require('os');

const prisma = new PrismaClient();

/**
 * Get local network IP address
 */
function getLocalIpAddress() {
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

/**
 * Get base URL for QR codes
 */
function getBaseUrl() {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Try to get network IP
  const localIp = getLocalIpAddress();
  if (localIp) {
    return `http://${localIp}:3000`;
  }

  // Fallback
  return 'http://localhost:3000';
}

async function regenerateQRCodes() {
  try {
    console.log('\n🔄 Regenerating QR codes...\n');

    const baseUrl = getBaseUrl();
    console.log(`📱 Using base URL: ${baseUrl}\n`);

    // Get all active stations
    const stations = await prisma.station.findMany({
      where: { deletedAt: null },
    });

    if (stations.length === 0) {
      console.log('❌ No stations found. Create a station first!\n');
      await prisma.$disconnect();
      return;
    }

    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }

    let successCount = 0;

    for (const station of stations) {
      const qrCodeFileName = `${station.id}.png`;
      const qrCodePath = path.join(qrCodeDir, qrCodeFileName);
      const complaintFormUrl = `${baseUrl}/complaint/${station.id}`;

      await QRCode.toFile(qrCodePath, complaintFormUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      console.log(`✅ Generated QR code for "${station.name}"`);
      console.log(`   URL: ${complaintFormUrl}`);
      console.log(`   File: ${qrCodeFileName}\n`);

      successCount++;
    }

    console.log(`\n🎉 Successfully regenerated ${successCount} QR code(s)!\n`);
    console.log('💡 Next steps:');
    console.log('   1. Make sure both servers are running:');
    console.log('      - Frontend: npm run dev (port 3000)');
    console.log('      - Backend:  npm run server:dev (port 4000)');
    console.log('   2. Scan the QR code from your phone');
    console.log('   3. Make sure your phone is on the same WiFi network\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error regenerating QR codes:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

regenerateQRCodes();
