# ShieldPay Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (can sign up with GitHub)
- Git installed locally
- Node.js 18+ installed

## Step 1: Prepare Your Project for Deployment

### 1.1 Create Production Build Configuration
First, let's ensure your project is ready for production deployment.

### 1.2 Add Environment Variables
Create a `.env.example` file to document required environment variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server
NODE_ENV=production
PORT=5000
```

### 1.3 Update Package.json Scripts
Ensure your package.json has the correct build and start scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:pg-native",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push:pg"
  }
}
```

## Step 2: Set Up GitHub Repository

### 2.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: ShieldPay fraud detection system"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository: `shieldpay-fraud-detection`
5. Add description: "UPI fraud detection system with AI-powered analysis"
6. Choose Public or Private
7. Click "Create repository"

### 2.3 Connect Local Repository to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/shieldpay-fraud-detection.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)
1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Configure Environment Variables in Vercel
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variables:

```
DATABASE_URL = your_postgresql_connection_string
JWT_SECRET = your_jwt_secret_key_here
NODE_ENV = production
```

### 3.4 Set Up Database
You have several options for PostgreSQL:

#### Option A: Neon (Recommended)
1. Go to [Neon](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string
4. Add it to Vercel environment variables as `DATABASE_URL`

#### Option B: Vercel Postgres
1. In your Vercel project, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. The DATABASE_URL will be automatically added to your environment variables

#### Option C: Supabase
1. Go to [Supabase](https://supabase.com) and create a project
2. Get the database URL from project settings
3. Add it to Vercel environment variables

## Step 4: Configure Vercel Deployment Settings

### 4.1 Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4.2 Update Build Process
Make sure your build process creates the correct output structure:

```bash
# This should create:
# dist/
#   ├── public/         (frontend build)
#   └── index.js        (backend build)
```

## Step 5: Deploy and Test

### 5.1 Push Changes to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 5.2 Trigger Deployment
1. Vercel will automatically deploy when you push to GitHub
2. Monitor the deployment in your Vercel dashboard
3. Check the deployment logs for any errors

### 5.3 Run Database Migrations
After successful deployment:
```bash
# If using Vercel CLI
vercel env pull .env.local
npm run db:push
```

## Step 6: Post-Deployment Setup

### 6.1 Test Your Application
1. Visit your Vercel URL (provided in dashboard)
2. Test login with: admin@shieldpay.com / admin123
3. Upload sample data files to test functionality
4. Verify all features work correctly

### 6.2 Set Up Custom Domain (Optional)
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## Step 7: Continuous Deployment

### 7.1 Automatic Deployments
Vercel automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### 7.2 Preview Deployments
- Every pull request gets a preview deployment
- Test changes before merging to main

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify build scripts are correct

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Check database service is running
   - Ensure connection string format is correct

3. **Environment Variables**
   - Make sure all required variables are set in Vercel
   - Check variable names match exactly
   - Redeploy after adding new variables

4. **File Upload Issues**
   - Vercel has file size limits for serverless functions
   - Consider using cloud storage for larger files

## Security Notes

- Never commit sensitive data to GitHub
- Use environment variables for all secrets
- Regularly rotate JWT secrets
- Monitor deployment logs for security issues
- Consider adding rate limiting for production

## Monitoring and Maintenance

- Monitor Vercel analytics and logs
- Set up error tracking (Sentry, LogRocket)
- Regular database backups
- Monitor performance metrics
- Update dependencies regularly

Your ShieldPay application should now be successfully deployed and accessible via your Vercel URL!