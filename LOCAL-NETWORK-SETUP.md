# 📱 Local Network QR Code Setup Guide

This guide will help you test QR code scanning on your phone during development.

## ✅ What Changed

The system has been configured to automatically use your local network IP address in QR codes, making them scannable from phones on the same WiFi network.

### Modified Files:

1. **server/routes/stations.ts** - QR codes now use local network IP automatically
2. **server/index.ts** - Backend listens on all network interfaces (0.0.0.0)
3. **package.json** - Frontend dev server listens on all network interfaces
4. **get-network-ip.js** - New utility to check your network IP

## 🚀 How to Use

### Step 1: Find Your Network IP

Run this command to see your local network IP:

```powershell
npm run network-ip
```

You'll see output like:

```
🌐 Network Information

✅ Local Network IP: 192.168.1.100

📱 Access URLs for mobile devices on same WiFi:
   Frontend:  http://192.168.1.100:3000
   Backend:   http://192.168.1.100:4000
```

### Step 2: Start Your Servers

**Terminal 1 - Backend:**

```powershell
npm run server:dev
```

Look for this in the output:

```
📱 Network Access URLs:
   Local:    http://localhost:4000
   Network:  http://192.168.1.100:4000

   ✅ Scan QR codes from your phone using the Network URL
```

**Terminal 2 - Frontend:**

```powershell
npm run dev
```

### Step 3: Create a Station & Generate QR Code

1. Open `http://localhost:3000/admin/login` in your browser
2. Login with admin credentials
3. Create a new station
4. The QR code will be automatically generated with your network IP

When you create a station, you'll see in the backend console:

```
📱 QR Code generated for station "Main Hall" at: http://192.168.1.100:3000/complaint/abc123
```

### Step 4: Scan with Your Phone

1. **Ensure your phone is on the SAME WiFi network as your laptop**
2. Open the QR code scanner on your phone (or any QR scanner app)
3. Scan the generated QR code
4. The complaint form will open on your phone! 🎉

## 🔥 Troubleshooting

### Problem: Phone can't connect after scanning

**Solution 1: Check WiFi**

- Verify phone and laptop are on the same WiFi network
- Guest networks often block device-to-device communication

**Solution 2: Windows Firewall**

- Windows may prompt you to allow Node.js through the firewall
- Click "Allow access" when prompted
- Or manually allow Node.js in Windows Defender Firewall settings

**Solution 3: Verify Network IP**

- Run `npm run network-ip` to confirm your current IP
- Your IP may change if you reconnect to WiFi
- Restart the servers after WiFi changes

### Problem: QR code still shows localhost

**Solution:**

- Make sure you created the station AFTER starting the updated backend
- Delete old stations and create new ones
- The QR code URL is generated when the station is created

### Problem: "Connection refused" error

**Solution:**

- Verify both servers are running (frontend on :3000, backend on :4000)
- Check that Next.js is using `-H 0.0.0.0` flag (should be in package.json)
- Restart both servers

## 🎯 Testing Checklist

- [ ] Run `npm run network-ip` and note your IP address
- [ ] Start backend server (`npm run server:dev`)
- [ ] Start frontend server (`npm run dev`)
- [ ] Phone and laptop on same WiFi
- [ ] Create new station in admin dashboard
- [ ] Download/display the QR code
- [ ] Scan QR code with phone
- [ ] Complaint form opens on phone
- [ ] Can submit complaint from phone

## 💡 Production Deployment

When deploying to production:

- Set `NEXT_PUBLIC_API_URL` environment variable to your production domain
- QR codes will automatically use the production URL instead of local IP
- Example: `NEXT_PUBLIC_API_URL=https://yourdomain.com`

## 📝 Technical Details

### How It Works

1. **IP Detection**: The `getBaseUrl()` function in `server/routes/stations.ts` automatically detects your local network IP
2. **Development vs Production**:
   - If `NEXT_PUBLIC_API_URL` is set → uses that (production)
   - If not set → detects local network IP (development)
3. **Network Binding**: Servers bind to `0.0.0.0` instead of `127.0.0.1`, allowing external connections

### Code Changes Summary

```typescript
// Before (localhost only):
const url = "http://localhost:3000/complaint/123";

// After (network accessible):
const url = "http://192.168.1.100:3000/complaint/123";
```

---

**Questions or issues?** Check the main README.md or review the changes in:

- `server/routes/stations.ts` (QR generation logic)
- `server/index.ts` (network binding)
- `package.json` (dev server config)
