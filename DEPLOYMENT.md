# 🚀 Deployment Guide

This guide will help you deploy your Database Schema Designer app to popular cloud platforms.

## ⚡ Recommended Deployment: Render

**This app is optimized for Render** because it uses a traditional Express server architecture that runs continuously. Render is the easiest and most reliable deployment option for this stack.

### Why Render Over Vercel?

- ✅ **Traditional server model** - Runs your Express server 24/7
- ✅ **Long-running AI operations** - No timeout issues with Cerebras API calls
- ✅ **WebSocket support** - Future collaboration features work seamlessly
- ✅ **Simple deployment** - One command, works out of the box
- ✅ **Better for this architecture** - Express backend + React frontend in monorepo

**Note:** Vercel is optimized for serverless/edge functions and would require significant restructuring of this app. We recommend Render instead.

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **GitHub Account** - Push your code to GitHub
2. **PostgreSQL Database** - You'll need a database URL (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
3. **Cerebras API Key** - Get one from [Cerebras](https://inference.cerebras.ai/) for AI features

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`)
- `apiKey` - Your Cerebras API key for AI schema generation
- `NODE_ENV` - Set to `production` (automatic on most platforms)

---

## 🟢 Deploy to Render (Recommended)

Render is the best choice for this app's architecture.

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 3: Configure Service

Render will auto-detect settings from `render.yaml`, but you can also configure manually:

- **Name**: `database-schema-designer`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for better performance)

### Step 4: Add Environment Variables

In Render dashboard → **Environment** tab, add:

```
DATABASE_URL = postgresql://your-database-url
apiKey = your-cerebras-api-key
NODE_ENV = production
```

### Step 5: Deploy

Click **"Create Web Service"**. First deploy takes 5-10 minutes. Your app will be live at `https://your-project.onrender.com`

### Important Notes for Render:

- ✅ The `render.yaml` file is already configured for auto-deployment
- ✅ Supports long-running connections and WebSockets
- ✅ Better for CPU-intensive AI operations
- ⚠️ Free tier: Services spin down after 15 minutes of inactivity (first request takes ~30s to wake up)
- ⚠️ Free tier databases are limited to 1GB storage
- 💡 Run `npm run db:push` after deployment to create database tables

---

## 🗄️ Database Setup

Both platforms require an external PostgreSQL database. Here are recommended providers:

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create account
2. Create a new project
3. Copy the **PostgreSQL connection string**
4. Add it as `DATABASE_URL` in your deployment platform

**Why Neon?** 
- Free tier includes 10GB storage
- Serverless PostgreSQL
- Auto-scaling
- Built for modern apps

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (make sure to use the "Connection pooling" URL for production)
5. Add it as `DATABASE_URL`

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the **DATABASE_URL** from the **Connect** tab
4. Add it to your deployment platform

---

## 🔑 Getting Cerebras API Key

1. Go to [inference.cerebras.ai](https://inference.cerebras.ai/)
2. Sign up for an account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key and add it as `apiKey` environment variable

**Note:** Keep your API key secret and never commit it to your repository!

---

## 🛠️ Post-Deployment Steps

### 1. Run Database Migrations

After deploying, create the database tables:

**For Vercel:**
```bash
# Run locally with production DATABASE_URL
DATABASE_URL="your-production-url" npm run db:push
```

**For Render:**
You can run this from Render's shell:
1. Go to your service → **Shell** tab
2. Run: `npm run db:push`

### 2. Test Your Deployment

Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ Can create a new schema project
- ✅ AI generation works (requires Cerebras API key)
- ✅ Projects save to database

### 3. Custom Domain (Optional)

**Vercel:**
- Go to **Settings** → **Domains**
- Add your custom domain
- Follow DNS configuration instructions

**Render:**
- Go to **Settings** → **Custom Domain**
- Add your domain
- Update DNS records as instructed

---

## 🚨 Troubleshooting

### Database Connection Errors

```
Error: DATABASE_URL must be set
```

**Solution:** Make sure `DATABASE_URL` is set in environment variables and includes credentials:
```
postgresql://user:password@host:5432/database_name
```

### API Key Not Working

```
API Key: undefined
```

**Solution:** Ensure `apiKey` environment variable is set (case-sensitive!)

### Build Fails

**Vercel:** Check build logs - might be missing dependencies
**Render:** Ensure `npm run build` completes successfully locally first

### App Loads but Features Don't Work

1. Check environment variables are set correctly
2. Check database tables were created (`npm run db:push`)
3. Check browser console for API errors
4. Verify Cerebras API key is valid

### Free Tier Limitations

**Vercel:**
- 100GB bandwidth/month
- Serverless functions: 100 hours/month
- 10s function timeout (Hobby), 60s (Pro)

**Render:**
- Services sleep after 15 min inactivity
- 750 hours/month free (one service can run 24/7)
- Slower cold starts

---

## 📊 Alternative Deployment Options

While this app is optimized for Render, here are other platforms you could use:

### Other Platforms

| Platform | Suitability | Notes |
|----------|------------|-------|
| **Render** | ✅ Perfect Match | Recommended - works out of the box |
| **Railway** | ✅ Excellent | Similar to Render, great alternative |
| **Fly.io** | ✅ Good | Requires Docker, but works well |
| **DigitalOcean App Platform** | ✅ Good | Traditional server model |
| **Heroku** | ⚠️ Works but costly | Legacy platform, expensive |
| **Vercel** | ❌ Not Recommended | Requires serverless restructuring |
| **Netlify** | ❌ Not Suitable | Static sites only |

### Why Not Vercel?

Vercel is designed for:
- Static sites
- Serverless/Edge functions
- Next.js apps

This app uses:
- Traditional Express server
- Long-running AI operations
- Persistent WebSocket connections (for future features)

To deploy on Vercel, you'd need to:
1. Restructure backend as serverless functions in `/api` directory
2. Handle cold starts and timeouts
3. Work around 10-second function limits on free tier

**For this app architecture, Render is simply easier and more reliable.**

---

## 🎯 Quick Deployment Command

### Render Deployment (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Go to render.com, create Web Service, connect repo
# 3. Render auto-detects settings from render.yaml
# 4. Add environment variables (DATABASE_URL, apiKey)
# 5. Click deploy!
```

### Railway Deployment (Alternative)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Add environment variables
railway variables set DATABASE_URL=your-db-url
railway variables set apiKey=your-api-key

# 4. Deploy
railway up
```

---

## 📝 Production Checklist

Before going live:

- [ ] Database is provisioned and accessible
- [ ] All environment variables are set
- [ ] Database migrations have been run (`npm run db:push`)
- [ ] Cerebras API key is valid and has credits
- [ ] App has been tested in production environment
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate is active (automatic on both platforms)
- [ ] Error monitoring is set up (optional: Sentry, LogRocket)

---

## 🆘 Getting Help

If you encounter issues:

1. **Vercel:** Check [Vercel Documentation](https://vercel.com/docs) or [Vercel Discord](https://vercel.com/discord)
2. **Render:** Check [Render Documentation](https://render.com/docs) or [Render Community](https://community.render.com)
3. **Database Issues:** Check your database provider's documentation
4. **Cerebras API:** Visit [Cerebras Documentation](https://inference-docs.cerebras.ai)

---

**Happy Deploying! 🎉**

Your Database Schema Designer app is now production-ready and easy to deploy to multiple platforms!
