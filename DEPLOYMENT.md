# 🚀 Deployment Guide for Render

This guide will help you deploy the Audio Conference application on Render.

## 📋 Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Render account (sign up at https://render.com)

## 🔧 Server Deployment (Backend)

### Step 1: Create a New Web Service on Render

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `audio-conference-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or your preferred plan)

### Step 2: Environment Variables

Add these environment variables in Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `3001` (Render will override this, but good to have as fallback)

### Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your server
3. Note the URL provided (e.g., `https://your-app.onrender.com`)

## 🎨 Frontend Deployment

### Option 1: Deploy Frontend on Render (Static Site)

1. Go to Render dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_SERVER_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)

### Option 2: Deploy Frontend on Vercel/Netlify

Similar process, but use their respective platforms.

## 🔗 Connecting Frontend to Backend

### Update Frontend Environment Variables

Create a `.env.production` file in the root directory:

```env
VITE_SERVER_URL=https://your-backend-app.onrender.com
```

Or set it in your deployment platform's environment variables.

### Update Vite Config (if needed)

The frontend will automatically detect the server URL from:
1. Environment variable `VITE_SERVER_URL`
2. Current window location (if deployed on same domain)
3. Manual entry by user

## 🌐 How It Works

### For Deployed Apps:
- **Server**: Automatically detects Render's external URL
- **Frontend**: Auto-detects server from current hostname or environment variable
- **No hardcoded IPs**: Everything is dynamic

### For Local Development:
- **Server**: Detects local network IP automatically
- **Frontend**: Can connect via `localhost` or detected IP
- **Flexible**: Works on any network

## ✅ Testing After Deployment

1. **Test Server**: Visit `https://your-app.onrender.com/api/server-info`
   - Should return server information JSON

2. **Test Frontend**: 
   - Open your deployed frontend URL
   - The Server Host field should auto-populate
   - Enter username and join conference

3. **Test Multi-User**:
   - Open frontend in two different browsers/devices
   - Both should connect to the same server
   - Test audio communication

## 🔧 Troubleshooting

### Server Not Starting
- Check Render logs for errors
- Verify `package.json` has correct start script
- Ensure PORT environment variable is set

### Frontend Can't Connect
- Verify backend URL is correct
- Check CORS settings (should allow all origins)
- Check browser console for errors

### Audio Not Working
- Ensure microphone permissions are granted
- Check WebRTC support in browser
- Verify Socket.IO connection is established

## 📝 Notes

- **Free Tier**: Render free tier spins down after inactivity. First request may be slow.
- **WebSocket Support**: Render supports WebSockets, so Socket.IO will work.
- **HTTPS**: Render provides HTTPS automatically, which is required for microphone access in browsers.

## 🎉 Success!

Once deployed, your app will work from anywhere in the world without hardcoded IPs!

