# Vercel Deployment Fix Guide

## ✅ What I Fixed

1. **Created Next.js API Route**: Moved authentication logic from Express backend to Next.js API route at [app/api/auth/login/route.ts](app/api/auth/login/route.ts)
2. **Updated Login Page**: Changed API call from external URL to relative path `/api/auth/login`
3. **Added Prisma Build Script**: Updated package.json to generate Prisma client during build
4. **Created Vercel Config**: Added vercel.json for environment variables

## 🚀 How to Deploy to Vercel

### Step 1: Set Up Database (Required)

You need a PostgreSQL database. Choose one:

**Option A: Vercel Postgres (Easiest)**

1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database" → Choose "Postgres"
4. Copy the `DATABASE_URL` (will be auto-added to your project)

**Option B: Neon Database (Free)**

1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string (starts with `postgresql://`)

**Option C: Supabase (Free)**

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add these variables:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-random-string-here
```

**To generate a secure JWT_SECRET**, run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Deploy to Vercel

**Method A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Method B: Using GitHub (Recommended)**

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

### Step 4: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy

# Or push schema directly
npx prisma db push
```

### Step 5: Create Admin Account

After deployment, create your first admin account:

```bash
# Replace with your deployed URL
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourSecurePassword123!"}'
```

Or use the seed script (if you have one):

```bash
npx prisma db seed
```

## 🔍 Testing Your Deployment

1. Visit `https://your-app.vercel.app/admin/login`
2. Enter the admin credentials you created
3. Should redirect to dashboard on successful login

## ❗ Important Notes

### Current Limitations

The current fix only covers the login endpoint. You'll need to migrate these other routes to Next.js API routes:

- `server/routes/stations.ts` → `app/api/stations/route.ts`
- `server/routes/complaints.ts` → `app/api/complaints/route.ts`
- `server/routes/notifications.ts` → `app/api/notifications/route.ts`
- `server/routes/voice.ts` → `app/api/voice/route.ts`

### WebSocket/Real-time Features

Vercel doesn't support WebSockets for real-time features (Socket.IO). For those features, you need to:

**Option 1**: Use Vercel's built-in real-time features

- Use Vercel's Server-Sent Events (SSE)
- Use polling instead of WebSockets

**Option 2**: Deploy backend separately

- Deploy Express backend to Railway, Render, or Fly.io
- Update `NEXT_PUBLIC_API_URL` to point to your backend server

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Error: "DATABASE_URL environment variable not found"

- Check Vercel dashboard → Settings → Environment Variables
- Make sure you added `DATABASE_URL`
- Redeploy after adding environment variables

### Error: "Invalid credentials" but credentials are correct

- Check if admin exists in database
- Run `npx prisma studio` to check database
- Create admin using seed script or API

### Login works locally but not on Vercel

- Check browser console for errors
- Check Vercel function logs: Dashboard → Deployments → Click deployment → Functions tab
- Ensure `JWT_SECRET` is set in Vercel environment variables

## 📋 Quick Deployment Checklist

- [ ] Database created and `DATABASE_URL` obtained
- [ ] Environment variables added to Vercel (DATABASE_URL, JWT_SECRET)
- [ ] Code pushed to GitHub (if using GitHub integration)
- [ ] Project deployed to Vercel
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Admin account created
- [ ] Login tested at `/admin/login`

## 🔗 Helpful Links

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Database](https://neon.tech)
- [Supabase](https://supabase.com)

---

## Need More Help?

If you encounter other errors, check:

1. Vercel deployment logs
2. Browser console (F12)
3. Vercel function logs for API errors
