/**
 * Utility script to get your local network IP address
 * Run this to find your IP for testing QR codes on mobile devices
 * 
 * Usage: node get-network-ip.js
 */

const os = require('os');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

const localIp = getLocalIpAddress();

console.log('\n🌐 Network Information\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (localIp) {
  console.log(`\n✅ Local Network IP: ${localIp}\n`);
  console.log(`📱 Access URLs for mobile devices on same WiFi:\n`);
  console.log(`   Frontend:  http://${localIp}:3000`);
  console.log(`   Backend:   http://${localIp}:4000`);
  console.log(`\n   QR codes will automatically use: http://${localIp}:3000\n`);
} else {
  console.log('\n❌ Could not detect local network IP');
  console.log('   Make sure you are connected to WiFi\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('💡 Tips:');
console.log('   1. Ensure your phone and laptop are on the same WiFi');
console.log('   2. Some corporate networks may block device-to-device communication');
console.log('   3. Windows Firewall may prompt you to allow Node.js - click "Allow"\n');
