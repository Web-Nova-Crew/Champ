# 🚀 Render Environment Variables Setup Guide

## Step-by-Step Instructions

### 1. Access Your Render Dashboard
1. Go to [render.com](https://render.com)
2. Log in to your account
3. Find your service: `champ-y6eg`
4. Click on the service name

### 2. Navigate to Environment Variables
1. In your service dashboard, click the **"Environment"** tab
2. You'll see a section for "Environment Variables"

### 3. Add These Environment Variables

**Copy and paste each variable exactly as shown:**

```
NODE_ENV=production
```

```
SUPABASE_URL=https://yapmbzqzahsyuxxdejpq.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcG1ienpxYWhzeXV4eGRlanBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTc5OTAsImV4cCI6MjA3ODE3Mzk5MH0.tff4ZU1_tFy2B13r0rklBVElIDTgO_ZGz1vtGFCo-kw
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcG1ienpxYWhzeXV4eGRlanBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU5Nzk5MCwiZXhwIjoyMDc4MTczOTkwfQ.jYYsxwRvg2B7ZCrn0rWykJnknwzeUUnAemSY5WLkhdk
```

```
JWT_SECRET=estato_jwt_secret_key_2024_secure_random_string_123456789
```

```
JWT_EXPIRE=7d
```

```
ALLOWED_ORIGINS=https://champ-y6eg.onrender.com,http://localhost:3000,http://localhost:8080,http://10.0.2.2:3000
```

```
RATE_LIMIT_WINDOW_MS=900000
```

```
RATE_LIMIT_MAX_REQUESTS=100
```

```
OTP_EXPIRE_MINUTES=10
```

```
OTP_LENGTH=6
```

```
APP_NAME=Estato
```

```
APP_URL=https://champ-y6eg.onrender.com
```

### 4. Save and Deploy
1. Click **"Save Changes"** button
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete

### 5. Test the Fix
Run this command to test if it worked:
```bash
node test-after-env-fix.js
```

## 🎯 What This Fixes
- ✅ "fetch failed" errors will disappear
- ✅ Registration will work properly
- ✅ Database connections will be established
- ✅ Authentication will function correctly

## 🔍 If You Need Help
1. Take a screenshot of your Render environment variables page
2. Check the "Logs" tab in Render for any error messages
3. The deployment should show "Live" status when complete

## ⚠️ Important Notes
- Make sure to copy the environment variables EXACTLY as shown
- Don't add extra spaces or characters
- The JWT tokens are long - make sure you copy them completely
- Wait for the deployment to complete before testing
