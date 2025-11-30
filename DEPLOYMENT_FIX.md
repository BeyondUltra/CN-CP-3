# 🔧 Fix for "Cannot GET /" Error on Render

## Problem
The "Cannot GET /" error means the frontend build files aren't being served by Express.

## Solution

### Option 1: Use Simple Build Command (Recommended)

In Render Dashboard → Your Service → Settings → Build Command:

```
npm install && npm run build
```

This is simpler and more reliable than using a shell script.

### Option 2: Verify Build is Running

1. **Check Render Build Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for "Building frontend..." message
   - Verify "Build complete!" message appears
   - Check if `dist/` directory is created

2. **Verify dist Directory:**
   - In build logs, you should see files being created
   - Look for `dist/index.html` in the output

### Option 3: Manual Verification

If build is failing, try this in Render's build command:

```bash
npm install && npm run build && ls -la dist/
```

This will show you if the dist directory is created.

## Common Issues

### Issue 1: Build Script Not Executing
**Fix:** Use direct npm commands instead of shell script:
```
npm install && npm run build
```

### Issue 2: dist Directory Not Found
**Fix:** Check that Vite is configured correctly. The default output is `dist/` in the root.

### Issue 3: Path Issues
**Fix:** The server.js uses `path.join(__dirname, 'dist')` which should work correctly.

## Testing Locally

Before deploying, test locally:

```bash
# Build frontend
npm run build

# Start server
npm start

# Visit http://localhost:3001
# Should see your React app, not "Cannot GET /"
```

## After Fixing

1. Commit changes:
   ```bash
   git add .
   git commit -m "Fix frontend serving on Render"
   git push
   ```

2. Render will automatically rebuild
3. Check logs to verify build succeeds
4. Visit your Render URL - should see the app!

