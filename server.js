const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3001;
const RECORDINGS_DIR = path.join(__dirname, 'recordings');

// Ensure recordings directory exists
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Encryption key for audio packets (simple XOR encryption)
const ENCRYPTION_KEY = crypto.randomBytes(32);

// Simple XOR encryption/decryption
function encryptAudio(data) {
  const buffer = Buffer.from(data);
  const encrypted = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    encrypted[i] = buffer[i] ^ ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
  }
  return encrypted;
}

function decryptAudio(encryptedData) {
  const buffer = Buffer.from(encryptedData);
  const decrypted = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    decrypted[i] = buffer[i] ^ ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
  }
  return decrypted;
}

// Store active participants and their data
const participants = new Map();
const connectionLogs = [];

// Network metrics tracking
const networkMetrics = {
  totalPacketsSent: 0,
  totalPacketsReceived: 0,
  activeThreads: 0
};

// Get local IP address dynamically
function getLocalIP() {
  // For production (Render, Heroku, etc.), use environment variable or request hostname
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    return process.env.RENDER_EXTERNAL_HOSTNAME;
  }
  
  // For local development, try to detect actual local IP
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // Fallback to localhost
  return 'localhost';
}

// Speech activity detection based on volume
function detectSpeechActivity(audioData) {
  // Simple volume-based speech detection
  const samples = new Int16Array(audioData);
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += Math.abs(samples[i]);
  }
  const averageVolume = sum / samples.length;
  const threshold = 1000; // Adjust this threshold as needed
  return averageVolume > threshold;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Add connection log
  const clientIP = socket.handshake.address;
  const timestamp = new Date().toISOString();
  connectionLogs.push({
    id: uuidv4(),
    socketId: socket.id,
    ip: clientIP,
    timestamp,
    action: 'connected'
  });

  // Send server info to client
  const serverIP = getLocalIP();
  socket.emit('server-info', {
    serverIP: serverIP,
    port: PORT,
    encryptionEnabled: true,
    serverUrl: process.env.RENDER_EXTERNAL_URL || `http://${serverIP}:${PORT}`
  });

  // Handle user joining
  socket.on('join-conference', (data) => {
    const { username, host, port } = data;
    
    // Create participant data
    const participant = {
      id: socket.id,
      username: username || `User_${socket.id.substring(0, 6)}`,
      socketId: socket.id,
      ip: clientIP,
      joinedAt: new Date().toISOString(),
      isMuted: false,
      isSpeaking: false,
      connectionStrength: 'good',
      audioData: null,
      recordingEnabled: false
    };

    participants.set(socket.id, participant);

    // Notify all clients about new participant
    socket.broadcast.emit('participant-joined', {
      id: participant.id,
      username: participant.username,
      joinedAt: participant.joinedAt
    });

    // Send current participants list to the new client
    socket.emit('participants-list', Array.from(participants.values()));

    // Add to connection log
    connectionLogs.push({
      id: uuidv4(),
      socketId: socket.id,
      ip: clientIP,
      username: participant.username,
      timestamp: new Date().toISOString(),
      action: 'joined'
    });

    console.log(`${participant.username} joined the conference`);
  });

  // Handle audio data
  socket.on('audio-data', (data) => {
    const participant = participants.get(socket.id);
    if (!participant || participant.isMuted) return;

    try {
      // Track network metrics
      networkMetrics.totalPacketsReceived++;
      
      // Decrypt audio data
      const decryptedAudio = decryptAudio(data.audioBuffer);
      
      // Detect speech activity
      const isSpeaking = detectSpeechActivity(decryptedAudio);
      
      // Update participant's speaking status
      if (participant.isSpeaking !== isSpeaking) {
        participant.isSpeaking = isSpeaking;
        socket.broadcast.emit('speech-activity', {
          participantId: socket.id,
          isSpeaking,
          username: participant.username
        });
      }

      // Store audio data for recording if enabled
      if (participant.recordingEnabled) {
        participant.audioData = participant.audioData || [];
        participant.audioData.push(decryptedAudio);
      }

      // Broadcast audio to other participants with sequence number
      networkMetrics.totalPacketsSent += participants.size - 1; // Count broadcasts
      socket.broadcast.emit('audio-stream', {
        participantId: socket.id,
        username: participant.username,
        audioBuffer: data.audioBuffer, // Send encrypted data
        timestamp: data.timestamp || Date.now(),
        sequence: data.sequence || 0
      });

    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  });

  // Handle mute/unmute
  socket.on('toggle-mute', (isMuted) => {
    const participant = participants.get(socket.id);
    if (participant) {
      participant.isMuted = isMuted;
      socket.broadcast.emit('participant-muted', {
        participantId: socket.id,
        username: participant.username,
        isMuted
      });
    }
  });

  // Handle recording toggle
  socket.on('toggle-recording', (isRecording) => {
    const participant = participants.get(socket.id);
    if (participant) {
      participant.recordingEnabled = isRecording;
      
      if (!isRecording && participant.audioData && participant.audioData.length > 0) {
        // Save recording
        saveRecording(participant);
        participant.audioData = null;
      }
      
      socket.emit('recording-status', { isRecording });
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    const participant = participants.get(socket.id);
    if (participant) {
      // Save any pending recording
      if (participant.recordingEnabled && participant.audioData) {
        saveRecording(participant);
      }

      // Notify other clients
      socket.broadcast.emit('participant-left', {
        participantId: socket.id,
        username: participant.username
      });

      // Remove from participants
      participants.delete(socket.id);

      // Add to connection log
      connectionLogs.push({
        id: uuidv4(),
        socketId: socket.id,
        ip: participant.ip,
        username: participant.username,
        timestamp: new Date().toISOString(),
        action: 'disconnected'
      });

      console.log(`${participant.username} left the conference`);
    }
  });
});

// Save recording function
function saveRecording(participant) {
  try {
    if (!participant.audioData || participant.audioData.length === 0) return;

    const filename = `recording_${participant.username}_${Date.now()}.wav`;
    const filepath = path.join(RECORDINGS_DIR, filename);

    // Combine all audio chunks
    const totalLength = participant.audioData.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = Buffer.alloc(totalLength);
    let offset = 0;

    for (const chunk of participant.audioData) {
      chunk.copy(combinedAudio, offset);
      offset += chunk.length;
    }

    // Create WAV file header
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = combinedAudio.length;
    const fileSize = 36 + dataSize;

    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // PCM format chunk size
    header.writeUInt16LE(1, 20);  // PCM format
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    // Write file
    const wavBuffer = Buffer.concat([header, combinedAudio]);
    fs.writeFileSync(filepath, wavBuffer);

    console.log(`Recording saved: ${filename}`);
    
    // Notify client
    const socket = io.sockets.sockets.get(participant.socketId);
    if (socket) {
      socket.emit('recording-saved', { filename, filepath });
    }

  } catch (error) {
    console.error('Error saving recording:', error);
  }
}

// API Routes
app.get('/api/server-info', (req, res) => {
  const serverIP = getLocalIP();
  const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://${serverIP}:${PORT}`;
  
  res.json({
    serverIP: serverIP,
    port: PORT,
    participantsCount: participants.size,
    encryptionEnabled: true,
    uptime: process.uptime(),
    serverUrl: serverUrl,
    // For client-side connection, use the request hostname if available
    clientServerUrl: req.headers.host ? `http://${req.headers.host}` : serverUrl
  });
});

app.get('/api/participants', (req, res) => {
  res.json(Array.from(participants.values()));
});

app.get('/api/connection-logs', (req, res) => {
  res.json(connectionLogs.slice(-50)); // Return last 50 logs
});

app.get('/api/recordings', (req, res) => {
  try {
    const files = fs.readdirSync(RECORDINGS_DIR)
      .filter(file => file.endsWith('.wav'))
      .map(file => ({
        filename: file,
        filepath: path.join(RECORDINGS_DIR, file),
        size: fs.statSync(path.join(RECORDINGS_DIR, file)).size,
        created: fs.statSync(path.join(RECORDINGS_DIR, file)).birthtime
      }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read recordings directory' });
  }
});

// Network metrics endpoint
app.get('/api/network-metrics', (req, res) => {
  // Calculate active threads (approximate using event loop and worker threads)
  const activeThreads = Math.max(1, Math.ceil(participants.size / 2) + 1);
  networkMetrics.activeThreads = activeThreads;
  
  res.json({
    activeThreads: networkMetrics.activeThreads,
    totalPacketsSent: networkMetrics.totalPacketsSent,
    totalPacketsReceived: networkMetrics.totalPacketsReceived,
    participantsCount: participants.size
  });
});

// Get the host to bind to
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for Render/cloud deployment
const serverIP = getLocalIP();

// Start server
server.listen(PORT, HOST, () => {
  const serverUrl = process.env.RENDER_EXTERNAL_URL 
    ? process.env.RENDER_EXTERNAL_URL 
    : `http://${serverIP}:${PORT}`;
  
  console.log(`🎧 Audio Conference Server running on ${serverUrl}`);
  console.log(`📡 Server IP: ${serverIP}`);
  console.log(`🌐 Listening on: ${HOST}:${PORT}`);
  console.log(`🔒 Encryption: Enabled`);
  console.log(`📁 Recordings directory: ${RECORDINGS_DIR}`);
  
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`☁️  Deployed on Render: ${process.env.RENDER_EXTERNAL_URL}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  // Save all active recordings
  participants.forEach(participant => {
    if (participant.recordingEnabled && participant.audioData) {
      saveRecording(participant);
    }
  });
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

