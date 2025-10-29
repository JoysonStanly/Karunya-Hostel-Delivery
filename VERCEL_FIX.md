# Vercel Deployment Configuration for Karunya Hostel Delivery

## ✅ FIX for "404: NOT_FOUND" Error

### What went wrong?
Vercel couldn't find your files because it didn't know this is a **monorepo** with separate frontend and backend folders.

---

## 🔧 SOLUTION 1: Deploy Frontend Only on Vercel (Recommended)

### Step 1: Update Vercel Settings

1. Go to your Vercel project dashboard
2. Click **Settings** → **General**
3. Update these settings:

   **Root Directory:** `frontend` ← Very important!
   **Framework Preset:** Vite
   **Build Command:** `npm run build`
   **Output Directory:** `dist`
   **Install Command:** `npm install`

4. Click **Save**

### Step 2: Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL = https://your-backend-url.onrender.com/api
VITE_SOCKET_URL = https://your-backend-url.onrender.com
```

**⚠️ IMPORTANT:** Use your actual backend URL!

### Step 3: Redeploy

Go to **Deployments** → Click the ⋯ menu on latest deployment → **Redeploy**

---

## 🔧 SOLUTION 2: Use Render for Both (Easier!)

Vercel is tricky with full-stack apps. **Render is better for your use case!**

### Quick Steps:

1. **Delete Vercel deployment** (or just ignore it)
2. Go to **[render.com](https://render.com)**
3. Deploy in 2 steps:

#### Deploy Backend:
```
New Web Service →
Root Directory: backend
Build: npm install
Start: npm start
```

#### Deploy Frontend:
```
New Static Site →
Root Directory: frontend
Build: npm install && npm run build
Publish: dist
```

Done! Much easier than Vercel for full-stack apps.

---

## 🔧 SOLUTION 3: Separate Vercel Deployments

Deploy frontend and backend as separate Vercel projects:

### For Frontend:
```
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

### For Backend:
```
Root Directory: backend
Build Command: npm install
Output Directory: .
```

---

## 🚀 What I Recommend:

### Best Option: **Render** (Simplest)
- Free tier
- Auto-deploys from GitHub
- Works perfectly with monorepos
- WebSocket support (Socket.io works!)

### Why Not Vercel for Backend:
- Serverless functions only (not ideal for Socket.io)
- More complex setup for full-stack
- Root directory issues with monorepo

---

## 📋 Quick Fix Checklist

If staying with Vercel:

1. ✅ Added `vercel.json` to frontend folder
2. ✅ Set Root Directory to `frontend` in Vercel settings
3. ✅ Set Output Directory to `dist`
4. ✅ Added environment variables
5. ✅ Redeploy

If switching to Render:

1. ✅ Sign up at render.com
2. ✅ Follow DEPLOY_NOW.md guide
3. ✅ Deploy backend first (get URL)
4. ✅ Deploy frontend with backend URL
5. ✅ Update CORS in backend

---

## 🆘 Still Not Working?

### Try this in Vercel:

1. Go to project → **Settings** → **General**
2. Scroll down and click **"Delete Project"**
3. Start fresh with correct settings from the beginning:
   - When importing, select repo
   - **BEFORE** clicking Deploy, click **"Configure Project"**
   - Set **Root Directory** to `frontend`
   - Set **Framework** to Vite
   - Add environment variables
   - Then click Deploy

---

## 📞 Which Error Are You Seeing?

### If 404 on all pages:
→ Root Directory not set to `frontend`

### If 404 only on refresh:
→ Need `vercel.json` with rewrites (already created)

### If build fails:
→ Missing environment variables or wrong build command

### If API calls fail:
→ Wrong `VITE_API_URL` or CORS issues

---

## ✅ Recommended Action Right Now:

Run these commands to push the fixes:

```powershell
cd "c:\Users\ASUS\Downloads\Karunya Hostel Delivery"
git add .
git commit -m "Fix: Add Vercel config for deployment"
git push
```

Then in Vercel:
1. **Settings** → **General** → Root Directory = `frontend`
2. **Deployments** → Redeploy

Or better yet, **use Render** - see DEPLOY_NOW.md!
