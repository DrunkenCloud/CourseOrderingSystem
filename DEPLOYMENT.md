# Deployment Guide

## Vercel Deployment

### Prerequisites
1. A PostgreSQL database (recommended: Supabase, Neon, or PlanetScale)
2. Vercel account
3. GitHub repository

### Step 1: Database Setup
Choose one of these PostgreSQL providers:

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (URI format)

#### Option B: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### Option C: PlanetScale
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Create a branch (main)
4. Get connection string

### Step 2: Vercel Deployment
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

### Step 3: Database Migration
After deployment, the build process will automatically:
1. Generate Prisma client
2. Run database migrations
3. Build the Next.js application

### Step 4: Seed Database (Optional)
To seed your database with initial data:
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Functions tab
4. Create a serverless function to run the seed script, or
5. Run locally: `npm run db:seed` (make sure DATABASE_URL points to production)

### Environment Variables Required
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### Build Commands
The following commands are configured in package.json:
- `npm run build` - Generates Prisma client and builds Next.js
- `npm run vercel-build` - Full build with migrations for Vercel
- `npm run postinstall` - Generates Prisma client after npm install

### Troubleshooting

#### Build Failures
1. **Prisma Generate Issues**: Ensure `prisma generate` runs before build
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Migration Issues**: Check if database schema matches Prisma schema

#### Runtime Issues
1. **Database Connection**: Ensure connection string includes SSL parameters
2. **Environment Variables**: Verify all required env vars are set in Vercel
3. **Prisma Client**: Check if client is properly generated

### Local Development
1. Copy `.env.example` to `.env`
2. Update DATABASE_URL with your local PostgreSQL connection
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run db:seed`
6. Run `npm run dev`

### Production Checklist
- [ ] Database created and accessible
- [ ] Environment variables configured in Vercel
- [ ] Repository connected to Vercel
- [ ] Build successful
- [ ] Database migrations applied
- [ ] Application accessible
- [ ] Login functionality working
- [ ] Database operations working

### Support
If you encounter issues:
1. Check Vercel build logs
2. Verify database connection
3. Ensure all environment variables are set
4. Check Prisma schema matches database structure