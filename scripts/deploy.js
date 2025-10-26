#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting deployment preparation...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run migrations
  console.log('🗄️  Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Build the application
  console.log('🏗️  Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Deployment preparation complete!');
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}