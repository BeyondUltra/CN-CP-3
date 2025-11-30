# 🔧 Hardcoded IP Address: 192.168.1.16

## 📋 Files Where IP is Hardcoded

### **1. Frontend Files**

#### **`src/components/WelcomePage.tsx`**
- **Line 15**: `const [host, setHost] = useState("192.168.1.16");`
- **Purpose**: Default server host in the frontend form
- **Usage**: When user opens the app, Server Host field shows `192.168.1.16`

### **2. Backend Files**

#### **`server/server.js`**
- **Line 61-63**: `function getLocalIP() { return '192.168.1.16'; }`
- **Line 349**: `server.listen(PORT, '192.168.1.16', () => {`
- **Line 350**: `console.log(\`🎧 Audio Conference Server running on http://192.168.1.16:${PORT}\`);`
- **Line 351**: `console.log(\`📡 Local IP: 192.168.1.16\`);`
- **Purpose**: Server binds to specific IP and reports it in logs

## 🎯 What This Means

### **Frontend Behavior:**
- ✅ **Server Host field** automatically shows `192.168.1.16`
- ✅ **No need to type IP manually**
- ✅ **Ready to connect immediately**

### **Backend Behavior:**
- ✅ **Server binds to** `192.168.1.16:3001`
- ✅ **Logs show** `192.168.1.16` as the IP
- ✅ **Consistent IP** across all connections

## 🚀 How to Use

### **Step 1: Start Backend Server**
```bash
cd server
node server.js
```

**Expected Output:**
```
🎧 Audio Conference Server running on http://192.168.1.16:3001
📡 Local IP: 192.168.1.16
🔒 Encryption: Enabled
📁 Recordings directory: [path]
```

### **Step 2: Open Frontend**
Go to `http://localhost:8081/`

### **Step 3: Join Conference**
- **Server Host field** already shows `192.168.1.16`
- **Enter username**
- **Click "Join Conference"**

## 🔧 If You Need to Change the IP

### **To Change to Different IP:**

#### **Frontend (`src/components/WelcomePage.tsx`):**
```typescript
// Line 15
const [host, setHost] = useState("YOUR_NEW_IP");
```

#### **Backend (`server/server.js`):**
```javascript
// Line 61-63
function getLocalIP() {
  return 'YOUR_NEW_IP';
}

// Line 349
server.listen(PORT, 'YOUR_NEW_IP', () => {

// Line 350
console.log(`🎧 Audio Conference Server running on http://YOUR_NEW_IP:${PORT}`);

// Line 351
console.log(`📡 Local IP: YOUR_NEW_IP`);
```

## 📋 Quick Test

1. **Start server**: `cd server && node server.js`
2. **Verify output**: Should show `192.168.1.16:3001`
3. **Open frontend**: `http://localhost:8081/`
4. **Check Server Host**: Should show `192.168.1.16`
5. **Enter username** and join

## 🎉 Benefits

- ✅ **No manual IP entry needed**
- ✅ **Consistent across frontend and backend**
- ✅ **Ready to use immediately**
- ✅ **No configuration required**

The IP `192.168.1.16` is now hardcoded in both frontend and backend for immediate use!
