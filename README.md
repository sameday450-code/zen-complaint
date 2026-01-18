# Complaint Reporting System

A production-ready, real-time complaint reporting system with QR code scanning and AI voice assistant capabilities.

## 🚀 Features

- **QR Code Complaint Submission** - Scan QR codes to submit complaints with photo/video evidence
- **AI Voice Assistant** - Voice-based complaint submission using ElevenLabs
- **Real-time Admin Dashboard** - Live updates using WebSocket (Socket.IO)
- **Secure Authentication** - JWT-based admin authentication
- **Cloud Storage** - S3-compatible storage for media uploads
- **PostgreSQL Database** - Robust data persistence with Prisma ORM
- **Production-Ready** - Rate limiting, input validation, error handling

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database (Neon recommended)
- AWS S3 or compatible storage (optional)
- ElevenLabs API key (for voice features)
- Twilio account (for phone integration)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```powershell
cd c:\Users\Ringrow\OneDrive\Desktop\real-zen
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```powershell
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (Get from Neon.tech)
DATABASE_URL="postgresql://user:password@host:5432/complaint_system?sslmode=require"

# JWT Secret (Generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=4000
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="http://localhost:4000"

# AWS S3 (Optional - for production)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="complaint-media-uploads"

# ElevenLabs (Get from elevenlabs.io)
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
ELEVENLABS_VOICE_ID="EXAVITQu4vr4xnSDxMaL"

# Twilio (Get from twilio.com)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WEBHOOK_URL="https://yourdomain.com/api/voice/webhook"
```

### 3. Database Setup

Generate Prisma client and push schema:

```powershell
npm run db:generate
npm run db:push
```

### 4. Create Initial Admin Account

Use this endpoint to create your first admin (should be protected in production):

```powershell
# Using PowerShell
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = "admin@example.com"
    password = "SecurePassword123!"
    name = "Admin User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -Headers $headers -Body $body
```

Or using curl in PowerShell:

```powershell
curl -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"SecurePassword123!\",\"name\":\"Admin User\"}'
```

## 🚀 Running the Application

### Development Mode

Run both backend and frontend in separate terminals:

**Terminal 1 - Backend Server:**

```powershell
npm run server:dev
```

**Terminal 2 - Next.js Frontend:**

```powershell
npm run dev
```

Both servers will now listen on all network interfaces (0.0.0.0), allowing access from:

- **Local machine**: `http://localhost:3000` (frontend) and `http://localhost:4000` (backend)
- **Network devices** (phones on same WiFi): `http://[YOUR-LOCAL-IP]:3000`

The backend will automatically display your local network IP when it starts. Look for:

```
📱 Network Access URLs:
   Local:    http://localhost:4000
   Network:  http://192.168.1.x:4000

   ✅ Scan QR codes from your phone using the Network URL
```

### 📱 Testing QR Codes on Your Phone

1. **Ensure both devices are on the same WiFi network**
2. When you create a station, the QR code will automatically contain your local network IP
3. Scan the QR code with your phone - it will open the complaint form
4. The console will show: `📱 QR Code generated for station "Station Name" at: http://192.168.1.x:3000/complaint/[id]`

### Production Mode

```powershell
# Build Next.js
npm run build

# Start backend
npm run server

# Start frontend
npm start
```

## 📱 Usage

### Admin Access

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. Access the dashboard to:
   - Add/manage stations
   - View complaints in real-time
   - Receive instant notifications
   - Download QR codes

### Customer Complaint Submission

**Via QR Code:**

1. Scan the QR code at any station
2. Accept privacy notice
3. Fill out the complaint form
4. Attach photos/videos (optional)
5. Submit

**Via Voice Call:**

1. Call the designated phone number
2. Follow the AI voice prompts
3. Provide station name, contact info, and complaint details
4. Complaint is automatically created in the system

## 🏗️ Project Structure

```
real-zen/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── admin/
│   │   ├── login/page.tsx        # Admin login
│   │   └── dashboard/page.tsx    # Admin dashboard
│   └── complaint/
│       └── [stationId]/page.tsx  # Complaint form
├── components/
│   └── admin/                    # Admin components
│       ├── StationList.tsx
│       ├── ComplaintList.tsx
│       ├── NotificationBell.tsx
│       └── AddStationModal.tsx
├── server/                       # Backend API
│   ├── index.ts                  # Express server
│   ├── socket.ts                 # WebSocket server
│   ├── routes/                   # API routes
│   ├── middleware/               # Auth, validation, rate limiting
│   └── lib/                      # Utilities (DB, storage, AI)
├── prisma/
│   └── schema.prisma             # Database schema
├── public/
│   └── qrcodes/                  # Generated QR codes
└── uploads/                      # Uploaded media files
```

## 🔐 Security Features

- JWT authentication with expiry
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- XSS and SQL injection protection
- Secure file upload validation
- CORS configuration
- Helmet.js security headers

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Create admin account
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify token

### Stations

- `GET /api/stations` - List all stations
- `POST /api/stations` - Create station (generates QR code)
- `GET /api/stations/:id` - Get station details
- `PUT /api/stations/:id` - Update station
- `DELETE /api/stations/:id` - Delete station

### Complaints

- `GET /api/complaints` - List complaints (admin)
- `POST /api/complaints` - Submit complaint (public)
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id/status` - Update status

### Notifications

- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all read

### Voice

- `POST /api/voice/initiate` - Start voice call
- `POST /api/voice/webhook` - Twilio webhook

## 🔌 WebSocket Events

**Client → Server:**

- `join-admin` - Join admin room
- `leave-admin` - Leave admin room

**Server → Client:**

- `new-complaint` - New complaint received
- `complaint-update` - Complaint status updated
- `station-update` - Station added/updated/deleted
- `notification` - New notification

## 📊 Database Schema

- **admins** - Admin users
- **stations** - Physical locations
- **complaints** - Customer complaints
- **media_files** - Uploaded evidence
- **notifications** - Real-time alerts
- **voice_calls** - Voice assistant records
- **activity_logs** - Audit trail

## 🎨 Customization

### Complaint Categories

Edit in `app/complaint/[stationId]/page.tsx`:

```typescript
const COMPLAINT_CATEGORIES = [
  "Service Quality",
  "Cleanliness",
  // Add more...
];
```

### Notification Sounds

Add browser notification support in `components/admin/NotificationBell.tsx`

### Branding

- Update colors in `tailwind.config.ts`
- Modify logo and branding in layout components

## 🐛 Troubleshooting

**Database Connection Issues:**

```powershell
# Verify DATABASE_URL is correct
# Test connection
npm run db:studio
```

**WebSocket Not Connecting:**

- Ensure backend is running on correct port
- Check NEXT_PUBLIC_WS_URL in .env
- Verify CORS settings

**File Upload Fails:**

- Check MAX_FILE_SIZE in .env
- Verify uploads/ directory exists and is writable
- Check S3 credentials if using cloud storage

## 📈 Production Deployment

### Backend (Node.js)

- Deploy to: Railway, Render, AWS EC2, DigitalOcean
- Set environment variables
- Use PM2 for process management

### Frontend (Next.js)

- Deploy to: Vercel, Netlify, AWS Amplify
- Configure environment variables
- Set up custom domain

### Database

- Use Neon, Supabase, or AWS RDS for PostgreSQL
- Enable SSL connections
- Set up regular backups

## 📝 License

MIT License - feel free to use for commercial projects

## 🤝 Support

For issues and questions:

- Check the troubleshooting section
- Review API documentation
- Inspect browser console and server logs

---

**Built with ❤️ using Next.js, Express, Prisma, Socket.IO, and ElevenLabs**
