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
4. Vercel will auto-detect it's a Next.js app
5. Configure environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
6. Deploy (Vercel will automatically run the build process)

### Step 3: Automatic Build Process
Vercel will automatically:
1. Install dependencies (`npm install` triggers `postinstall` → `prisma generate`)
2. Run build command (`prisma generate && next build`)
3. Deploy the application

For production database setup, you may need to run migrations manually:
- Use your database provider's migration tools, or
- Run `npx prisma migrate deploy` with your production DATABASE_URL

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
```

### Build Commands
The following commands are configured in package.json:
- `npm run build` - Generates Prisma client and builds Next.js
- `npm run vercel-build` - Full build with migrations for Vercel
- `npm run postinstall` - Generates Prisma client after npm install

### Troubleshooting

#### Build Failures
1. **Prisma Generate Issues**: Ensure `prisma generate` runs before build
2. **Database Connection**: Verify DATABASE_URL is correct and accessible from Vercel
3. **Migration Issues**: Run `npx prisma migrate deploy` manually if needed
4. **Runtime Errors**: Remove `vercel.json` if present (Next.js 13+ auto-configures)
5. **Package Manager**: Ensure build scripts use `npm` not `pnpm` for Vercel compatibility

#### Runtime Issues
1. **Database Connection**: Ensure connection string includes SSL parameters
2. **Authentication**: Uses custom localStorage-based auth (no external auth service needed)
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