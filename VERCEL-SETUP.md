# Vercel Deployment Setup

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Database (REQUIRED)

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Get from: Vercel Postgres, Neon, Supabase, or any PostgreSQL provider

### 2. JWT Secret (REQUIRED)

```
JWT_SECRET=your-secure-random-string-here
```

Generate with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Node Environment

```
NODE_ENV=production
```

## Optional Environment Variables

### AWS S3 (for file uploads)

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=complaint-media-uploads
```

### ElevenLabs (for voice features)

```
ELEVENLABS_API_KEY=your-api-key
ELEVENLABS_VOICE_ID=your-voice-id
```

## Deployment Steps

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in project settings
4. Deploy!

The build command is automatically set in package.json: `prisma generate && next build`
