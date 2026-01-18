# 🚀 Vercel Production Deployment Guide

## ✅ Pre-Deployment Checklist

Your application is now **PRODUCTION READY** for Vercel! Here's what was fixed:

### Fixed Issues:

1. ✅ **Removed Express server dependency** - All API routes now use Next.js API routes
2. ✅ **Updated API calls** - Changed from external URLs to relative paths (`/api/*`)
3. ✅ **Fixed Prisma configuration** - Removed outdated `PRISMA_GENERATE_DATAPROXY`
4. ✅ **Optimized build process** - Proper standalone output for Vercel
5. ✅ **CORS headers configured** - API routes will work in production
6. ✅ **Removed WebSocket dependency** - WebSocket won't work on Vercel serverless, but core features work

---

## 📋 Step-by-Step Deployment

### STEP 1: Set Up Database

You **MUST** have a PostgreSQL database. Choose one option:

#### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project (or create it first)
3. Click **Storage** tab
4. Click **Create Database** → Choose **Postgres**
5. **DATABASE_URL** will be automatically added to your environment variables ✅

#### Option B: Neon (Free Tier Available)

1. Go to https://neon.tech
2. Create account and new project
3. Copy the connection string (starts with `postgresql://`)
4. Save it - you'll need it in Step 2

#### Option C: Supabase (Free Tier Available)

1. Go to https://supabase.com
2. Create new project
3. Go to **Settings** → **Database**
4. Copy the connection string under "Connection string"
5. Save it - you'll need it in Step 2

---

### STEP 2: Deploy to Vercel

#### First Time Deployment:

1. **Install Vercel CLI** (optional, but recommended):

   ```bash
   npm i -g vercel
   ```

2. **Push code to GitHub** (if not already):

   ```bash
   git add .
   git commit -m "Production ready for Vercel"
   git push
   ```

3. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click **Deploy**

---

### STEP 3: Configure Environment Variables

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add these **REQUIRED** variables:

   ```
   DATABASE_URL
   ```

   Value: Your PostgreSQL connection string from Step 1

   ```
   JWT_SECRET
   ```

   Value: Generate using this command:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Copy the output and paste it here.

4. Click **Save**

---

### STEP 4: Set Up Database Tables

After deployment, you need to create database tables:

**Method 1: Using Vercel CLI (Recommended)**

```bash
vercel env pull .env.production
npx prisma db push
```

**Method 2: Via Vercel Terminal**

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Functions** → **Environment Variables**
3. Open Terminal in project
4. Run: `npx prisma db push`

---

### STEP 5: Create Admin User

You need at least one admin account to login:

**Method 1: Update and run seed script**

```bash
npx prisma db seed
```

**Method 2: Using Prisma Studio**

```bash
npx prisma studio
```

Then manually create an admin record:

- Email: admin@example.com
- Password: (hash it first using bcrypt)
- Name: Admin
- Role: admin

**Method 3: Direct SQL** (if you have database access):

```sql
INSERT INTO admins (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

To hash a password using Node.js:

```javascript
const bcrypt = require("bcryptjs");
const hashedPassword = bcrypt.hashSync("your-password", 10);
console.log(hashedPassword);
```

---

### STEP 6: Test Your Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Go to admin login: `https://your-app.vercel.app/admin/login`
3. Login with your admin credentials
4. Verify dashboard loads without "fetch failed" errors ✅

---

## 🔧 Troubleshooting

### Issue: "Fetch failed" on login

**Cause:** Missing environment variables or database not set up

**Fix:**

1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify `DATABASE_URL` and `JWT_SECRET` are set
3. Redeploy: Settings → Deployments → Click ⋮ → Redeploy

---

### Issue: "Prisma Client not generated"

**Fix:**

```bash
vercel env pull
npx prisma generate
git add .
git commit -m "Regenerate Prisma client"
git push
```

---

### Issue: Database connection failed

**Fix:**

1. Verify your DATABASE_URL has `?sslmode=require` at the end
2. Example: `postgresql://user:pass@host:5432/db?sslmode=require`
3. Test connection locally first

---

## 🎯 What Works in Production

✅ Admin authentication and login
✅ Station management (create, edit, delete)
✅ QR code generation
✅ Complaint submission
✅ File uploads (stored in `/public/uploads`)
✅ Status updates
✅ Notifications (stored in database)
✅ All API endpoints

---

## ⚠️ What Doesn't Work (Serverless Limitations)

❌ **WebSocket/Socket.IO** - Vercel serverless doesn't support long-lived connections

- Real-time notifications won't work
- Use polling or Vercel's Edge Functions as alternative

❌ **Local file storage** - Files in `/public/uploads` are ephemeral

- Upload files to S3/Cloudflare R2 for persistence
- Set AWS environment variables (see .env.production.example)

---

## 🔐 Security Checklist

Before going fully live:

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable 2FA if possible
- [ ] Set up database backups
- [ ] Configure rate limiting (already included)
- [ ] Review CORS settings in next.config.js
- [ ] Set up monitoring (Vercel Analytics)

---

## 📈 Recommended Next Steps

1. **Set up custom domain** (Vercel Dashboard → Settings → Domains)
2. **Enable Vercel Analytics** (for monitoring)
3. **Set up S3 for file uploads** (configure AWS variables)
4. **Add database backups** (via your database provider)
5. **Configure email notifications** (optional)

---

## 🆘 Need Help?

If you still see "fetch failed" after following this guide:

1. Check browser console for specific errors
2. Check Vercel Functions logs: Dashboard → Deployments → View Function Logs
3. Verify all environment variables are set correctly
4. Make sure database tables are created (`npx prisma db push`)
5. Ensure at least one admin user exists in the database

---

## 📱 Testing Checklist

After deployment, test these features:

- [ ] Admin login works
- [ ] Dashboard loads without errors
- [ ] Can create new station
- [ ] QR code is generated
- [ ] Can scan QR code and submit complaint
- [ ] Complaint appears in dashboard
- [ ] Can update complaint status
- [ ] Can view notifications

---

**Your app is ready for production! 🎉**

Main URLs:

- **Homepage**: `https://your-app.vercel.app`
- **Admin Login**: `https://your-app.vercel.app/admin/login`
- **Admin Dashboard**: `https://your-app.vercel.app/admin/dashboard`
