# 🚀 Deployment Guide - Karunya Hostel Delivery

## Complete Step-by-Step Deployment Instructions

---

## 📋 Pre-Deployment Checklist

✅ All completed and verified:
- Database: MongoDB Atlas (already configured)
- Backend: Node.js + Express + Socket.io
- Frontend: React + Vite
- All dependencies installed
- API endpoints tested

---

## Option 1: Render (Recommended - FREE) 🆓

### Why Render?
- Free tier available
- Easy deployment
- Auto-deploys from GitHub
- Built-in SSL certificates
- Good for full-stack apps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already):
```powershell
cd "c:\Users\ASUS\Downloads\Karunya Hostel Delivery"
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/JoysonStanly/Karunya-Hostel-Delivery.git
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `karunya-hostel-backend`
   - **Region**: Choose closest to India (Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://joy:joy123@karunyahostel.qmbjcr4.mongodb.net/karunyahostel?retryWrites=true&w=majority
   JWT_SECRET=karunya-hostel-delivery-super-secret-jwt-key-2024
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
   ⚠️ **Note**: You'll update `FRONTEND_URL` after deploying frontend

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy your backend URL**: `https://karunya-hostel-backend.onrender.com`

### Step 3: Deploy Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `karunya-hostel-delivery`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://karunya-hostel-backend.onrender.com/api
   VITE_SOCKET_URL=https://karunya-hostel-backend.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

5. Click **"Create Static Site"**
6. Wait for deployment (3-5 minutes)

### Step 4: Update Backend CORS

1. Go back to backend service on Render
2. Update environment variable:
   ```
   FRONTEND_URL=https://karunya-hostel-delivery.onrender.com
   ```
   (Your actual frontend URL)
3. Service will auto-redeploy

### Step 5: Test Your Deployment
Visit: `https://karunya-hostel-delivery.onrender.com`

---

## Option 2: Vercel (Frontend) + Railway (Backend) 🚄

### Best for: Better performance, also has free tier

### A. Deploy Backend on Railway

1. **Go to [Railway.app](https://railway.app)** and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Click **"Add variables"** and add:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://joy:joy123@karunyahostel.qmbjcr4.mongodb.net/karunyahostel
   JWT_SECRET=karunya-hostel-delivery-super-secret-jwt-key-2024
   JWT_EXPIRE=30d
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. In **Settings**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Install Command**: `npm install`

6. Deploy and copy your backend URL (e.g., `https://karunya-hostel-backend.up.railway.app`)

### B. Deploy Frontend on Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.up.railway.app
   ```

6. Click **"Deploy"**
7. Update Railway backend's `FRONTEND_URL` with your Vercel URL

---

## Option 3: Netlify (Frontend) + Render (Backend) 🎯

### A. Backend on Render (Same as Option 1)

### B. Frontend on Netlify

1. **Go to [Netlify.com](https://netlify.com)** and sign up
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Click **"Advanced"** → **"New variable"**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```

6. Click **"Deploy"**

---

## Option 4: Traditional VPS (DigitalOcean, AWS, etc.) 💪

### For full control and better performance

### Step 1: Setup Ubuntu VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/JoysonStanly/Karunya-Hostel-Delivery.git
cd Karunya-Hostel-Delivery
```

### Step 3: Setup Backend

```bash
cd backend
sudo npm install

# Create .env file
sudo nano .env
```

Add:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://joy:joy123@karunyahostel.qmbjcr4.mongodb.net/karunyahostel
JWT_SECRET=karunya-hostel-delivery-super-secret-jwt-key-2024
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com
```

Start with PM2:
```bash
pm2 start server.js --name "karunya-backend"
pm2 save
pm2 startup
```

### Step 4: Build Frontend

```bash
cd ../frontend

# Create .env file
sudo nano .env
```

Add:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

Build:
```bash
sudo npm install
sudo npm run build
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/karunya-delivery
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/Karunya-Hostel-Delivery/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/karunya-delivery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Post-Deployment Configuration

### 1. Update MongoDB Atlas Network Access
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific IPs of your hosting provider

### 2. Test All Endpoints

Use the test script:
```powershell
# Update the API_BASE_URL in test-api.js to your production URL
# Then run:
node backend/test-api.js
```

### 3. Monitor Your Application

For Render/Railway/Vercel:
- Check logs in their dashboard
- Set up alerts for downtime

For VPS:
```bash
# View PM2 logs
pm2 logs

# Monitor processes
pm2 monit
```

---

## 🚨 Important Security Notes

### Before going live:

1. **Change JWT Secret** to something very secure:
   ```
   JWT_SECRET=your-very-long-and-random-secret-key-here-change-this
   ```

2. **Update MongoDB Password** (optional but recommended):
   - Go to MongoDB Atlas → Database Access
   - Edit user and change password
   - Update `MONGODB_URI` in your environment variables

3. **Enable Rate Limiting** (already done in code)

4. **Setup Monitoring**:
   - Use Sentry for error tracking
   - Use UptimeRobot for uptime monitoring
   - Enable MongoDB Atlas alerts

---

## 📊 Cost Comparison

| Platform | Backend | Frontend | Database | Total/Month |
|----------|---------|----------|----------|-------------|
| Render Free | $0 | $0 | MongoDB Atlas Free | **$0** |
| Vercel + Railway | $0 | $0 | MongoDB Atlas Free | **$0** |
| DigitalOcean | $6 | - | MongoDB Atlas Free | **$6** |
| AWS Lightsail | $5 | - | MongoDB Atlas Free | **$5** |

**Recommendation**: Start with Render (Option 1) - completely free and easy!

---

## 🎯 Quick Deploy Commands (For Render/Vercel)

### If you haven't pushed to GitHub yet:

```powershell
cd "c:\Users\ASUS\Downloads\Karunya Hostel Delivery"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/JoysonStanly/Karunya-Hostel-Delivery.git

# Push to GitHub
git push -u origin main
```

Then follow Option 1 steps above!

---

## 🐛 Troubleshooting Deployment Issues

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct (must include `/api`)
- Check CORS settings in backend
- Ensure backend is actually running

### Socket.io not connecting
- Verify `VITE_SOCKET_URL` doesn't have `/api`
- Check WebSocket support on hosting platform
- Ensure backend allows WebSocket connections

### Database connection fails
- Add hosting provider's IP to MongoDB Atlas whitelist
- Or use 0.0.0.0/0 to allow all (less secure but works)

---

## ✅ Post-Deployment Checklist

After deployment, verify:
- [ ] Can register new user
- [ ] Can login
- [ ] Can create order
- [ ] Can accept order (delivery student)
- [ ] OTP is generated
- [ ] Real-time chat works
- [ ] Can complete delivery with OTP
- [ ] Leaderboard shows data
- [ ] Mobile responsive
- [ ] HTTPS is working
- [ ] Favicon appears

---

## 🎉 You're Ready to Deploy!

**Recommended Path for Beginners:**
1. Push code to GitHub
2. Deploy backend on Render (5 min)
3. Deploy frontend on Render (3 min)
4. Update CORS and test
5. Share your live URL!

**Your app will be live at:**
- Frontend: `https://karunya-hostel-delivery.onrender.com`
- Backend: `https://karunya-hostel-backend.onrender.com`

Need help? Check the logs or let me know! 🚀
