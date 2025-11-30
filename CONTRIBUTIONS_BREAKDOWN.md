# 🎧 Audio Conference Project - 4 Contributions Breakdown

## 📋 Project Overview
**Real-time audio communication application with LAN support, built with React, Node.js, and Socket.IO.**

---

## 🔧 BACKEND CONTRIBUTIONS

### **Contribution 1: Core Backend Server & Real-time Communication**
**Files:** `server/server.js`, `server/package.json`

#### **Features Implemented:**
- ✅ **Express + Socket.IO server setup**
- ✅ **Real-time WebSocket communication**
- ✅ **Audio data processing and streaming**
- ✅ **Participant management system**
- ✅ **Connection logging and IP tracking**
- ✅ **REST API endpoints** (`/api/server-info`, `/api/participants`, `/api/connection-logs`)

#### **Key Code Sections:**
```javascript
// Socket.IO connection handling
io.on('connection', (socket) => {
  // Handle user joining
  socket.on('join-conference', (data) => { ... });
  
  // Handle audio data streaming
  socket.on('audio-data', (data) => { ... });
  
  // Handle mute/unmute
  socket.on('toggle-mute', (isMuted) => { ... });
});

// Audio processing pipeline
function detectSpeechActivity(audioData) { ... }
function encryptAudio(data) { ... }
function decryptAudio(encryptedData) { ... }
```

#### **Technical Details:**
- **Port:** 3001 (hardcoded to 192.168.1.16)
- **Protocol:** HTTP/WebSocket for signaling
- **Audio Format:** 44.1kHz, 16-bit, mono PCM
- **Encryption:** XOR encryption for audio packets
- **Speech Detection:** Volume-based activity detection

---

### **Contribution 2: Audio Recording & Security Features**
**Files:** `server/server.js` (recording functions), `server/recordings/` directory

#### **Features Implemented:**
- ✅ **WAV file recording system**
- ✅ **Audio data collection and storage**
- ✅ **XOR encryption/decryption**
- ✅ **Speech activity detection**
- ✅ **Recording management API**
- ✅ **File system operations**

#### **Key Code Sections:**
```javascript
// Recording functionality
function saveRecording(participant) {
  // Create WAV file header
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  // ... WAV header creation
  
  // Combine audio chunks and save
  const wavBuffer = Buffer.concat([header, combinedAudio]);
  fs.writeFileSync(filepath, wavBuffer);
}

// Encryption system
function encryptAudio(data) {
  const buffer = Buffer.from(data);
  const encrypted = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    encrypted[i] = buffer[i] ^ ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
  }
  return encrypted;
}
```

#### **Technical Details:**
- **Recording Format:** WAV files with proper headers
- **Encryption:** 32-byte XOR key
- **Storage:** Server-side recordings directory
- **API Endpoint:** `/api/recordings`

---

## 🎨 FRONTEND CONTRIBUTIONS

### **Contribution 3: Audio Service & Real-time Communication**
**Files:** `src/hooks/useAudioService.ts`, `src/pages/Index.tsx`

#### **Features Implemented:**
- ✅ **WebRTC audio capture using Web Audio API**
- ✅ **Socket.IO client integration**
- ✅ **Real-time audio streaming**
- ✅ **Audio data processing and playback**
- ✅ **Connection state management**
- ✅ **Participant synchronization**

#### **Key Code Sections:**
```typescript
// Audio capture and streaming
const startAudioCapture = useCallback(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { echoCancellation: true, noiseSuppression: true }
  });
  
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (event) => {
    // Convert and send audio data
    const int16Array = new Int16Array(inputData.length);
    socket.emit('audio-data', { audioBuffer: int16Array.buffer });
  };
}, [socket, isMuted]);

// Audio playback
const playAudioData = useCallback(async (audioBuffer: ArrayBuffer) => {
  const int16Array = new Int16Array(audioBuffer);
  const float32Array = new Float32Array(int16Array.length);
  
  // Convert and play audio
  const audioBufferNode = audioContext.createBuffer(1, float32Array.length, 44100);
  audioBufferNode.copyToChannel(float32Array, 0);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBufferNode;
  source.connect(audioContext.destination);
  source.start();
}, []);
```

#### **Technical Details:**
- **Audio API:** Web Audio API for capture and playback
- **Data Format:** Float32Array → Int16Array conversion
- **Real-time:** 4096 sample buffer size
- **Connection:** Socket.IO client with auto-reconnect

---

### **Contribution 4: User Interface & Experience**
**Files:** `src/components/WelcomePage.tsx`, `src/components/ConferenceDashboard.tsx`, `src/components/ParticipantCard.tsx`, `src/components/SettingsPanel.tsx`

#### **Features Implemented:**
- ✅ **Modern React UI with shadcn/ui components**
- ✅ **LAN IP detection and display**
- ✅ **Server status monitoring**
- ✅ **Participant management interface**
- ✅ **Audio controls (mute/unmute, recording)**
- ✅ **Real-time connection logs**
- ✅ **Responsive design**

#### **Key Code Sections:**
```typescript
// LAN IP detection
useEffect(() => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  
  pc.onicecandidate = (event) => {
    const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
    if (ipMatch && !ipMatch[1].startsWith('127.')) {
      setLocalIP(ipMatch[1]);
    }
  };
}, []);

// Real-time participant updates
const participants = useAudioService({ serverUrl, username });
```

#### **UI Components:**
- **WelcomePage:** Server connection and IP configuration
- **ConferenceDashboard:** Main conference interface
- **ParticipantCard:** Individual participant display
- **SettingsPanel:** Audio and connection settings

#### **Technical Details:**
- **Framework:** React + TypeScript + Vite
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **State Management:** React hooks

---

## 📊 Contribution Summary

| Contribution | Type | Files | Key Features |
|-------------|------|-------|---------------|
| **1** | Backend | `server/server.js`, `server/package.json` | Core server, Socket.IO, audio streaming, participant management |
| **2** | Backend | `server/server.js` (recording), `server/recordings/` | WAV recording, encryption, speech detection, file management |
| **3** | Frontend | `src/hooks/useAudioService.ts`, `src/pages/Index.tsx` | Audio capture, WebRTC, real-time streaming, connection management |
| **4** | Frontend | `src/components/*.tsx` | UI components, LAN detection, participant interface, controls |

---

## 🎯 Implementation Requirements Met

### **Core Requirements:**
- ✅ **Working client-server audio exchange (LAN)**
- ✅ **Two clients talking live**

### **Additional Features (All 7 Implemented):**
1. ✅ **🎙 Recording Option** - WAV file saving
2. ✅ **🧑‍🤝‍🧑 Username System** - Participant management
3. ✅ **🔇 Mute/Unmute Button** - Audio control
4. ✅ **📶 Connection Log Display** - IP tracking
5. ✅ **📡 LAN/IP Detection** - Automatic IP detection
6. ✅ **🔒 Encryption** - XOR encryption for audio
7. ✅ **🪄 Speech Activity Detection** - Volume-based detection

---

## 🚀 Setup Instructions

### **Backend Setup:**
```bash
cd server
npm install
node server.js
```

### **Frontend Setup:**
```bash
npm install
npm run dev
```

### **Access:**
- **Frontend:** `http://localhost:8081/`
- **Backend:** `http://192.168.1.16:3001/`

This breakdown shows how the project can be divided into 4 distinct contributions, each with clear responsibilities and technical implementations.
