# 🚀 Deployment Guide - My AI Signal Trading Platform

## 📋 Prerequisites

Before deploying, make sure you have:
- GitHub repository with the code
- Vercel account (for frontend)
- Render account (for backend)
- API keys and secrets ready

## 🔧 Required Environment Variables

### 1. **TWELVE_DATA_API_KEY**
- **Purpose**: Fetch real-time forex market data
- **How to get**: Sign up at [twelvedata.com](https://twelvedata.com)
- **Format**: String API key (e.g., "abcd1234efgh5678")

### 2. **TELEGRAM_BOT_TOKEN**
- **Purpose**: Telegram Mini App integration
- **How to get**: Create bot via @BotFather on Telegram
- **Format**: Bot token (e.g., "123456789:ABCdefGHIjklMNOpqrsTUVwxyz")

### 3. **ADMIN_TOKEN**
- **Purpose**: Admin panel authentication
- **How to get**: Create your own secure token
- **Format**: Secure string (e.g., "admin_secure_token_123")

### 4. **JWT_SECRET**
- **Purpose**: JWT token signing
- **How to get**: Generate random secure string
- **Format**: Random string (e.g., "jwt_secret_key_abc123def456")

## 🌐 Vercel Deployment (Frontend)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `SignalsAI1/My_Signal_Ai_app`
4. Select framework: **React**

### Step 2: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```
TWELVE_DATA_API_KEY=your_actual_twelve_data_api_key
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token
ADMIN_TOKEN=your_actual_admin_token
JWT_SECRET=your_actual_jwt_secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app
```

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your frontend will be live at `https://your-app-name.vercel.app`

## 🖥️ Render Deployment (Backend)

### Step 1: Connect to Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select branch: **main**

### Step 2: Configure Service
- **Name**: `my-ai-signal-backend`
- **Environment**: **Node**
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### Step 3: Add Environment Variables
```
TWELVE_DATA_API_KEY=your_actual_twelve_data_api_key
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token
ADMIN_TOKEN=your_actual_admin_token
JWT_SECRET=your_actual_jwt_secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your backend will be live at `https://your-service-name.onrender.com`

## 🔗 Connect Frontend to Backend

After both services are deployed:

### Update Frontend API URL
In `frontend/src/App.tsx` or wherever you make API calls:

```typescript
// Replace localhost with your Render backend URL
const API_BASE_URL = 'https://your-service-name.onrender.com';
```

### Update CORS Settings
In `backend/index.js`, ensure your frontend URL is in CORS:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-app-name.vercel.app'
  ],
  credentials: true
};
```

## 🧪 Testing Deployment

### 1. Frontend Tests
- Visit your Vercel URL
- Check if the app loads properly
- Test navigation between pages

### 2. Backend Tests
- Visit your Render URL + `/api/market`
- Should return market data
- Test admin panel at `/api/admin/users`

### 3. Integration Tests
- Test user registration
- Test signal generation
- Test admin functionality

## 🚨 Common Issues & Solutions

### Issue: "Environment Variable does not exist"
**Solution**: 
- Make sure all variables are added in Vercel/Render dashboards
- Check for typos in variable names
- Ensure values are not empty

### Issue: CORS errors
**Solution**:
- Add your frontend URL to backend CORS settings
- Ensure backend is running and accessible

### Issue: API calls failing
**Solution**:
- Check if backend is deployed and running
- Verify API endpoints are correct
- Check network tab in browser for errors

### Issue: Build failures
**Solution**:
- Check build logs for specific errors
- Ensure all dependencies are installed
- Verify environment variables are set

## 📞 Support

If you encounter issues:

1. **Check logs**: Both Vercel and Render provide detailed logs
2. **Verify environment variables**: Ensure all required variables are set
3. **Test locally**: Make sure the app works locally before deploying
4. **Check network**: Ensure services can communicate with each other

## 🔄 CI/CD Pipeline

The project includes GitHub Actions for:
- **Testing**: Runs tests on push
- **Deployment**: Auto-deploys to Vercel/Render on main branch
- **Documentation**: Deploys docs to GitHub Pages

### GitHub Secrets Required
In GitHub repository → Settings → Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID` 
- `VERCEL_PROJECT_ID`
- `RENDER_SERVICE_ID`
- `RENDER_API_KEY`

## 🎯 Next Steps

After successful deployment:

1. **Monitor performance**: Check Vercel Analytics and Render metrics
2. **Set up alerts**: Configure error monitoring
3. **Scale as needed**: Upgrade plans based on traffic
4. **Backup data**: Regular backups of user data
5. **Security audit**: Regular security reviews

---

**🎉 Congratulations! Your AI Signal Trading Platform is now live!**

For additional help, check the [GitHub repository](https://github.com/SignalsAI1/My_Signal_Ai_app) or create an issue.
