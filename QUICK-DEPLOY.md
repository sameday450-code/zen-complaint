# 🚀 QUICK DEPLOYMENT REFERENCE

## Deploy in 5 Minutes

### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push
```

### 2. Deploy to Vercel

- Go to https://vercel.com/new
- Import your GitHub repo
- Click "Deploy"

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

**DATABASE_URL** (Required)

- Get from: Vercel Postgres, Neon, or Supabase
- Format: `postgresql://user:pass@host:5432/db?sslmode=require`

**JWT_SECRET** (Required)

- Generate: Run this in terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Copy output and paste as JWT_SECRET value

### 4. Set Up Database

After first deployment:

```bash
# Pull env vars
vercel env pull

# Create database tables
npx prisma db push

# Create admin user
npx prisma db seed
```

### 5. Test Login

- Visit: `https://your-app.vercel.app/admin/login`
- Login with seeded admin credentials
- Verify no "fetch failed" errors ✅

---

## Default Admin Credentials (After Seed)

Check [prisma/seed.ts](prisma/seed.ts) for the credentials, or create your own in Prisma Studio.

---

## Troubleshooting

**"Fetch failed" on login:**

- Check environment variables are set
- Verify DATABASE_URL is correct
- Make sure `npx prisma db push` was run

**"Prisma Client not found":**

```bash
npx prisma generate
```

**Database connection error:**

- Ensure DATABASE_URL ends with `?sslmode=require`
- Test connection locally first

---

## What's Different from Local Development

### ✅ Works the Same:

- Admin login
- Station management
- Complaint submission
- QR codes
- All API endpoints

### ⚠️ Doesn't Work (Serverless Limitations):

- WebSocket real-time updates (use polling instead)
- Local file storage (use S3 - see [.env.production.example](.env.production.example))

---

## Important URLs

- **Homepage:** `https://your-app.vercel.app`
- **Admin Login:** `https://your-app.vercel.app/admin/login`
- **Dashboard:** `https://your-app.vercel.app/admin/dashboard`
- **Complaint Form:** `https://your-app.vercel.app/complaint/[stationId]`

---

## Need More Help?

See detailed guides:

- [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) - Full step-by-step guide
- [PRODUCTION-REVIEW.md](PRODUCTION-REVIEW.md) - Technical review
- [.env.production.example](.env.production.example) - All environment variables

---

**You're ready to deploy! 🎉**
