# Render Deployment Guide

## Prerequisites

1. **MongoDB Database**
   - You need a MongoDB database (MongoDB Atlas recommended)
   - Get your MongoDB connection string (MONGODB_URI)

2. **Render Account**
   - Sign up at [render.com](https://render.com)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Make sure all files are committed

### Step 2: Create MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or use your existing MongoDB)
2. Create a new cluster (or use existing)
3. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your actual password
5. Add database name at the end: `mongodb+srv://.../consolatrix_db`

### Step 3: Deploy on Render

#### Option A: Using Render Dashboard

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Select your repository and branch

2. **Configure Build Settings**
   - **Name**: `consolatrix-connect` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose Free or Paid plan

3. **Set Environment Variables**
   Click "Environment" tab and add:
   
   **Required:**
   - `MONGODB_URI` = Your MongoDB connection string
     ```
     mongodb+srv://username:password@cluster.mongodb.net/consolatrix_db
     ```
   
   **Optional (with defaults):**
   - `MONGODB_DB` = `consolatrix_db` (default)
   - `ADMIN_EMAIL` = `admin@consolatrix.edu` (default)
   - `ADMIN_PASSWORD` = Your admin password (default: `Admin@2025`)
   - `ADMIN_SEED_TOKEN` = Random secure token for admin seed endpoint (optional)
   - `NODE_ENV` = `production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Your app will be live at `https://your-app-name.onrender.com`

#### Option B: Using render.yaml (Recommended)

1. **Important:** For Render Blueprint to work, you need to copy `render.yaml` from `docs/` folder to the **root** of your project
2. In Render Dashboard:
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml` in the root
   - Set the `MONGODB_URI` environment variable
   - Deploy!

**Note:** If using Blueprint method, copy `docs/render.yaml` to the project root before pushing to GitHub.

### Step 4: Configure Custom Domain (Optional)

1. In Render Dashboard → Your Service → Settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB connection string |
| `MONGODB_DB` | No | `consolatrix_db` | Database name |
| `ADMIN_EMAIL` | No | `admin@consolatrix.edu` | Admin login email |
| `ADMIN_PASSWORD` | No | `Admin@2025` | Admin login password |
| `ADMIN_SEED_TOKEN` | No | - | Token for admin seed endpoint |
| `NODE_ENV` | No | `production` | Node environment |

## Post-Deployment Checklist

✅ **Verify HTTPS**: Render provides HTTPS automatically (required for PWA)

✅ **Test PWA Install**:
   - Open your deployed site
   - Click "Install Now" button
   - Verify install prompt appears (Chrome/Edge)
   - Test on mobile devices

✅ **Test Database Connection**:
   - Visit: `https://your-app.onrender.com/api/health/db`
   - Should return: `{"ok": true, "connected": true}`

✅ **Test Environment Variables**:
   - Visit: `https://your-app.onrender.com/api/health/env`
   - Should show environment variable status

✅ **Test Login**:
   - Go to login page
   - Use admin credentials to login
   - Verify redirect works

✅ **Test PWA Offline Mode**:
   - Install PWA on mobile
   - Turn off internet
   - Open PWA
   - Verify offline functionality works

## Troubleshooting

### Build Fails

**Error: Module not found**
- Solution: Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: TypeScript errors**
- Solution: Already handled - `ignoreBuildErrors: true` in `next.config.mjs`

### App Crashes on Start

**Error: MongoDB connection failed**
- Check `MONGODB_URI` is set correctly
- Verify MongoDB allows connections from Render IPs (0.0.0.0/0)
- Check MongoDB Atlas Network Access settings

**Error: Port already in use**
- Render automatically sets PORT - no action needed
- Next.js handles PORT automatically

### PWA Not Working

**Install button doesn't work**
- Verify site is on HTTPS (Render provides this)
- Check browser console for errors
- Verify `manifest.json` is accessible: `https://your-app.onrender.com/manifest.json`
- Verify service worker: `https://your-app.onrender.com/service-worker.js`

**Icons not showing**
- Verify `/images/logo-icon.png` exists in `public` folder
- Check file paths in `manifest.json`

## Render Free Tier Limitations

- **Spins down after 15 minutes of inactivity**
- **Takes 30-60 seconds to wake up** (cold start)
- **750 hours/month free** (enough for always-on if single service)
- **512MB RAM** (should be enough for this app)

## Upgrading to Paid Plan

If you need:
- Always-on (no spin-down)
- More resources
- Better performance

Upgrade to a paid plan in Render Dashboard.

## Support

- Render Docs: https://render.com/docs
- Render Support: support@render.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

