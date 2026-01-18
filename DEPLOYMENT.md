# Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] Change all default passwords and secrets
- [ ] Generate strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Review and restrict CORS origins
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Remove or protect `/api/auth/register` endpoint
- [ ] Enable rate limiting on all public endpoints
- [ ] Review file upload size limits
- [ ] Enable database SSL connections

### Database
- [ ] Use production PostgreSQL (Neon, Supabase, AWS RDS)
- [ ] Run migrations: `npm run db:migrate`
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Create database indexes
- [ ] Enable query logging for monitoring

### Storage
- [ ] Configure S3 or compatible cloud storage
- [ ] Set up CDN for media files (CloudFront, Cloudflare)
- [ ] Configure bucket CORS policies
- [ ] Enable bucket versioning
- [ ] Set up lifecycle policies for old files

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure application logging
- [ ] Set up uptime monitoring
- [ ] Enable WebSocket connection monitoring
- [ ] Set up database query monitoring

### Performance
- [ ] Enable Next.js image optimization
- [ ] Configure caching headers
- [ ] Enable gzip/brotli compression
- [ ] Optimize database queries
- [ ] Set up Redis for session management (optional)

## Deployment Steps

### 1. Backend Deployment (Node.js/Express)

**Using PM2:**
```bash
npm install -g pm2
pm2 start server/index.ts --name complaint-api
pm2 save
pm2 startup
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=your-production-db-url
JWT_SECRET=your-secure-secret
```

### 2. Frontend Deployment (Next.js)

**Build:**
```bash
npm run build
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Environment Variables in Vercel:**
- NEXT_PUBLIC_API_URL=https://api.yourdomain.com
- NEXT_PUBLIC_WS_URL=https://api.yourdomain.com

### 3. Database Migration

```bash
npm run db:migrate
```

### 4. Create First Admin

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"SecurePass123!","name":"Admin"}'
```

**Then immediately disable the register endpoint!**

## Post-Deployment

### Testing
- [ ] Test admin login
- [ ] Create a test station and verify QR code generation
- [ ] Submit a test complaint via QR code
- [ ] Verify real-time notifications work
- [ ] Test file uploads
- [ ] Test voice call integration (if enabled)
- [ ] Test on mobile devices
- [ ] Verify email notifications (if implemented)

### Monitoring
- [ ] Monitor error rates
- [ ] Check server response times
- [ ] Monitor database connections
- [ ] Track WebSocket connections
- [ ] Review security logs

### Documentation
- [ ] Document admin procedures
- [ ] Create user guide for customers
- [ ] Document backup/restore procedures
- [ ] Update API documentation

## Recommended Services

### Hosting
- **Frontend:** Vercel, Netlify, AWS Amplify
- **Backend:** Railway, Render, Heroku, AWS EC2
- **Database:** Neon, Supabase, AWS RDS
- **Storage:** AWS S3, Cloudflare R2, DigitalOcean Spaces

### Monitoring
- **Errors:** Sentry
- **Uptime:** UptimeRobot, Pingdom
- **Analytics:** Plausible, Google Analytics
- **Logs:** Logtail, Papertrail

### Performance
- **CDN:** Cloudflare, AWS CloudFront
- **Caching:** Redis Cloud, Upstash

## Maintenance

### Regular Tasks
- Review and update dependencies monthly
- Monitor database size and optimize
- Review security logs weekly
- Test backup restoration quarterly
- Update SSL certificates before expiry
- Review and clean up old media files

### Scaling Considerations
- Implement database read replicas
- Add Redis for session/cache management
- Use load balancer for multiple backend instances
- Implement CDN for static assets
- Consider microservices for voice features

## Emergency Procedures

### Database Backup
```bash
pg_dump -h hostname -U username -d database > backup.sql
```

### Database Restore
```bash
psql -h hostname -U username -d database < backup.sql
```

### Rollback Deployment
```bash
pm2 restart complaint-api
# Or rollback in Vercel dashboard
```

## Support Contacts

- Database: [Database provider support]
- Hosting: [Hosting provider support]
- DNS: [DNS provider support]
- Storage: [Storage provider support]

---

**Last Updated:** 2024
**Version:** 1.0.0
