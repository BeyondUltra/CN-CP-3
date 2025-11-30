# 🔧 Audio Troubleshooting Guide

## 🎯 Quick Audio Test

### **Step 1: Check Browser Console**
1. **Open browser** (`http://localhost:8081/`)
2. **Press F12** → Console tab
3. **Look for these messages:**
   - ✅ `Connected to server`
   - ✅ `Audio capture started`
   - ❌ Any red error messages

### **Step 2: Test Microphone**
1. **Click microphone icon** in browser address bar
2. **Allow microphone access**
3. **Speak into microphone**
4. **Check if you see audio levels** in console

### **Step 3: Test Two Tabs**
1. **Tab 1**: Username `Alice` → Join Conference
2. **Tab 2**: Username `Bob` → Join Conference
3. **Both should show**: 2 participants connected

### **Step 4: Test Audio Flow**
1. **Speak in Tab 1** (Alice)
2. **Check Tab 2** (Bob) - should hear audio
3. **Speak in Tab 2** (Bob)
4. **Check Tab 1** (Alice) - should hear audio

## 🐛 Common Audio Issues

### **Issue 1: No Audio Heard**
**Possible Causes:**
- Microphone permission denied
- Audio context not initialized
- Audio data not being processed correctly

**Solutions:**
1. **Check microphone permissions**
2. **Refresh browser page**
3. **Try different browser**

### **Issue 2: Audio Distorted**
**Possible Causes:**
- Sample rate mismatch
- Audio buffer size issues
- Encoding/decoding problems

**Solutions:**
1. **Check browser audio settings**
2. **Try different microphone**
3. **Check Windows audio settings**

### **Issue 3: Audio Delay**
**Possible Causes:**
- Network latency
- Audio buffer size too large
- Processing delays

**Solutions:**
1. **Check network connection**
2. **Reduce audio buffer size**
3. **Close other applications**

## 🔍 Debug Information

### **Check Browser Console for:**
```javascript
// These messages should appear:
"Connected to server"
"Audio capture started"
"Audio data sent"
"Audio data received"
"Audio played"
```

### **Check Network Tab:**
1. **Press F12** → Network tab
2. **Look for WebSocket connections**
3. **Check if audio data is being sent**

### **Check Audio Context:**
```javascript
// In browser console, type:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Microphone access granted'))
  .catch(err => console.error('Microphone access denied:', err));
```

## 🚀 Quick Fixes

### **Fix 1: Reset Audio Context**
1. **Refresh browser page**
2. **Allow microphone permission again**
3. **Join conference again**

### **Fix 2: Check Audio Settings**
1. **Right-click speaker icon** in Windows
2. **Open Sound settings**
3. **Check microphone levels**

### **Fix 3: Try Different Browser**
1. **Chrome**: Usually works best
2. **Firefox**: Good alternative
3. **Edge**: Should work fine

## 📋 Step-by-Step Test

### **1. Start Backend Server**
```bash
cd server
node server.js
```

### **2. Open Two Browser Tabs**
- **Tab 1**: `http://localhost:8081/` → Username: `Alice`
- **Tab 2**: `http://localhost:8081/` → Username: `Bob`

### **3. Check Both Tabs Show:**
- ✅ **Server Status**: Online
- ✅ **Participants**: 2 Connected
- ✅ **Microphone**: Not muted

### **4. Test Audio:**
- **Speak in Tab 1** → Should hear in Tab 2
- **Speak in Tab 2** → Should hear in Tab 1

### **5. Check Console:**
- **No red errors**
- **Audio messages appearing**
- **WebSocket connected**

## 🎉 Expected Behavior

### **Working Audio:**
- ✅ **Real-time audio streaming**
- ✅ **Low latency**
- ✅ **Clear audio quality**
- ✅ **No distortion**

### **If Still Not Working:**
1. **Check Windows Firewall**
2. **Try different microphone**
3. **Check browser audio settings**
4. **Verify microphone works in other apps**

The audio should now work properly between tabs!
