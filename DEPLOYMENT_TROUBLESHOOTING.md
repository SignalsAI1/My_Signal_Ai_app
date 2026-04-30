# 🔧 Deployment Troubleshooting Guide

## 🚨 Current Vercel Deployment Issue

**Deployment ID:** `dpl_9CjovwgTEPZT5Ed1k5ahZnaWyU5L`

### **Error Message:**
```
Vercel – my-signal-ai-app - Розгортання не вдалося — запустіть цю команду Vercel CLI: npx vercel inspect dpl_9CjovwgTEPZT5Ed1k5ahZnaWyU5L --logs
```

## 🔍 How to Debug Vercel Deployment

### **Method 1: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Inspect Deployment Logs:**
   ```bash
   npx vercel inspect dpl_9CjovwgTEPZT5Ed1k5ahZnaWyU5L --logs
   ```

### **Method 2: Using Vercel Dashboard**

1. **Go to Vercel Dashboard:** [vercel.com](https://vercel.com)
2. **Select your project:** `my-signal-ai-app`
3. **Go to Deployments tab**
4. **Click on the failed deployment**
5. **View the Build Logs and Function Logs**

## 🛠️ Common Vercel Deployment Issues & Solutions

### **Issue 1: Environment Variables Missing**
**Symptoms:** Build fails with missing API keys or secrets
**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all required variables:
   ```
   TWELVE_DATA_API_KEY=your_actual_key
   TELEGRAM_BOT_TOKEN=your_actual_token
   ADMIN_TOKEN=your_admin_token
   JWT_SECRET=your_jwt_secret
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

### **Issue 2: Build Configuration Problems**
**Symptoms:** Build fails during npm install or build process
**Solution:**
1. Check `package.json` build scripts
2. Verify `vercel.json` configuration
3. Ensure all dependencies are in `package.json`

### **Issue 3: Monorepo Structure Issues**
**Symptoms:** Can't find frontend or backend directories
**Solution:**
1. Verify `vercel.json` has correct paths
2. Check that `frontend/package.json` exists
3. Ensure build commands are correct

### **Issue 4: Runtime Errors**
**Symptoms:** App builds but crashes on startup
**Solution:**
1. Check environment variables
2. Verify API endpoints are accessible
3. Check for missing dependencies

## 📋 Quick Debugging Checklist

### **Before Running Inspect Command:**
- [ ] Node.js installed (v18+)
- [ ] Vercel CLI installed
- [ ] Logged into Vercel account
- [ ] Correct deployment ID

### **After Getting Logs:**
- [ ] Look for specific error messages
- [ ] Check for missing dependencies
- [ ] Verify environment variables
- [ ] Check build configuration

## 🔧 Manual Debugging Steps

### **Step 1: Check Local Build**
```bash
# Test frontend build locally
cd frontend
npm install
npm run build

# Test backend locally
cd ../backend
npm install
npm start
```

### **Step 2: Verify Environment Variables**
```bash
# Check if .env.local exists and has correct values
cat .env.local

# Verify required variables are set
echo $TWELVE_DATA_API_KEY
echo $TELEGRAM_BOT_TOKEN
```

### **Step 3: Test API Endpoints**
```bash
# Test market data endpoint
curl http://localhost:3001/api/market

# Test admin endpoint
curl -H "admin: your_admin_token" http://localhost:3001/api/admin/users
```

## 🚀 Alternative Deployment Methods

### **If Vercel Continues to Fail:**

#### **Option 1: Netlify**
1. Connect GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/build`
4. Add environment variables in Netlify dashboard

#### **Option 2: Railway**
1. Connect GitHub repository to Railway
2. Set build command: `cd frontend && npm install && npm run build`
3. Set start command: `cd frontend && npm start`
4. Add environment variables

#### **Option 3: DigitalOcean App Platform**
1. Create new app from GitHub repository
2. Set build command and source directory
3. Configure environment variables
4. Deploy

## 📞 Getting Help

### **Vercel Support:**
- **Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Support:** [vercel.com/support](https://vercel.com/support)
- **Community:** [vercel.com/community](https://vercel.com/community)

### **Project-Specific Help:**
- **GitHub Issues:** Create issue in repository
- **Documentation:** Check `DEPLOYMENT_GUIDE.md`
- **Code Review:** Verify all configurations

## 🔄 Next Steps

### **Immediate Actions:**
1. **Install Vercel CLI** locally
2. **Run inspect command** to get detailed logs
3. **Analyze error messages** from logs
4. **Fix identified issues**

### **Long-term Solutions:**
1. **Set up proper monitoring** for deployments
2. **Create automated testing** for builds
3. **Implement rollback strategy**
4. **Document all environment variables**

---

## 📝 Template for Error Reporting

When reporting deployment issues, include:

```
Deployment ID: dpl_9CjovwgTEPZT5Ed1k5ahZnaWyU5L
Error Message: [Copy exact error]
Build Logs: [Attach relevant log snippets]
Environment Variables: [Confirm which are set]
Steps Taken: [List what you've tried]
```

**🎯 Goal:** Get the deployment working and document the solution for future reference.
