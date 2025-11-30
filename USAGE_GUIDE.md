# 🎧 Audio Conference - How to Use the Updated Interface

## 🚀 Quick Start Guide

### **Step 1: Start the Backend Server**
```bash
# Open a new terminal/command prompt
cd "C:\Users\nidhi\VIT\Computer Network\echo-bliss-73-main\echo-bliss-73-main\server"
node server.js
```

**Look for this output:**
```
🎧 Audio Conference Server running on http://192.168.1.100:3001
📡 Local IP: 192.168.1.100
```

**Note down the IP address shown!** (e.g., `192.168.1.100`)

### **Step 2: Open Frontend**
- Go to `http://localhost:8081/`
- You should see the Audio Conference welcome page

### **Step 3: Configure Server Connection**

#### **Option A: Use Detected IP (Recommended)**
1. The app will automatically detect your local IP
2. Click **"Use Detected IP"** button next to "Server Host"
3. The Server Host field will be filled automatically

#### **Option B: Manual IP Entry**
1. Look at the "Local IP" section
2. Copy the IP address (click the copy icon)
3. Paste it into the "Server Host" field
4. Or click **"Use This IP"** button

#### **Option C: Manual Entry**
1. Type your IP address manually in the "Server Host" field
2. Use the copy button to copy the current value

### **Step 4: Join Conference**
1. Enter your username
2. Verify Server Host shows your correct IP
3. Click **"Join Conference"**
4. Allow microphone permissions

## 🔧 New Features Added

### **1. Enhanced Server Host Field**
- **Larger input field** for easier editing
- **Copy button** to copy the current IP
- **"Use Detected IP" button** for quick setup
- **Placeholder text** for guidance

### **2. Improved Local IP Section**
- **Copy button** to copy detected IP
- **"Use This IP" button** to set it as Server Host
- **Visual feedback** when copying (checkmark appears)

### **3. Better Layout**
- **Server Host** field is now more prominent
- **Port field** is separate and clear
- **Better spacing** and organization

## 🎯 How to Test Multi-User

### **Method 1: Multiple Browser Tabs**
1. **Tab 1**: Username "Alice" → Join Conference
2. **Tab 2**: Username "Bob" → Join Conference  
3. **Tab 3**: Username "Charlie" → Join Conference

### **Method 2: Different Browsers**
- **Chrome**: Username "Alice"
- **Firefox**: Username "Bob"
- **Edge**: Username "Charlie"

## 🔍 Troubleshooting

### **If "Server Offline" appears:**
1. Make sure backend server is running
2. Check if the IP address is correct
3. Try clicking "Use Detected IP" button
4. Verify port 3001 is not blocked

### **If IP detection fails:**
1. Manually enter your IP address
2. Use `ipconfig` command to find your IP
3. Copy the IPv4 address from your network adapter

### **If connection still fails:**
1. Check Windows Firewall settings
2. Try using `localhost` instead of IP
3. Verify the server is actually running

## 📋 What You Should See

### **Working Setup:**
- ✅ Backend server shows your actual IP
- ✅ Frontend shows "Server Online"
- ✅ Multiple users can join
- ✅ Audio communication works
- ✅ Real-time participant updates

### **Server Output Example:**
```
🎧 Audio Conference Server running on http://192.168.1.100:3001
📡 Local IP: 192.168.1.100
🔒 Encryption: Enabled
📁 Recordings directory: C:\...\server\recordings
```

### **Frontend Interface:**
- Server Status: 🟢 Online
- Local IP: 192.168.1.100 [Copy] [Use This IP]
- Server Host: 192.168.1.100 [Copy]
- Server Port: 3001

## 🎉 Success!

Once everything is working:
1. **Multiple tabs** show the same participant list
2. **Audio streams** between all participants
3. **Real-time updates** when users join/leave
4. **Mute/unmute** works independently
5. **Recording** works from any tab

The updated interface makes it much easier to configure the correct IP address for your server!
