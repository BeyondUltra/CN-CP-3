# Audio Conference Application

A real-time audio communication application with LAN support, built with React, Node.js, and Socket.IO.

## Features Implemented

### Core Requirements ✅
- **Working client-server audio exchange (LAN)** - Real-time audio streaming using WebRTC and Socket.IO
- **Two clients talking live** - Multiple participants can join and communicate simultaneously

### Additional Features ✅
1. **🎙 Recording Option** - Save all audio in .wav format using wave library
2. **🧑‍🤝‍🧑 Username System** - Each client enters a name and shows active participants
3. **🔇 Mute/Unmute Button** - Toggle microphone sending
4. **📶 Connection Log Display** - Server shows connected IPs in GUI
5. **📡 LAN/IP Detection** - Automatically detect local IP and display it
6. **🔒 Encryption (Bonus)** - Simple XOR encryption for audio packets
7. **🪄 Speech Activity Detection** - Volume level detection to show who's speaking

## Project Structure

```
├── server/                 # Backend server
│   ├── server.js          # Main server file
│   ├── package.json       # Server dependencies
│   └── recordings/        # Audio recordings directory
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   └── pages/            # Page components
└── package.json          # Frontend dependencies
```

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Start the Backend Server

```bash
cd server
npm start
```

The server will start on `http://localhost:3001` by default.

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Usage

1. **Start the Server**: Run the backend server first
2. **Open Frontend**: Open the React app in your browser
3. **Enter Username**: Enter your name in the welcome page
4. **Join Conference**: Click "Join Conference" to connect
5. **Start Talking**: Your microphone will be activated automatically
6. **Use Controls**:
   - **Mute/Unmute**: Toggle your microphone
   - **Record**: Start/stop recording the session
   - **Leave**: Exit the conference

## Technical Details

### Backend Features
- **Socket.IO Server**: Handles real-time communication
- **Audio Processing**: Captures, encrypts, and streams audio data
- **Recording System**: Saves audio as WAV files
- **Connection Logging**: Tracks all participant connections
- **Speech Detection**: Analyzes audio volume for activity detection
- **Encryption**: XOR encryption for audio packets

### Frontend Features
- **WebRTC Audio Capture**: Uses Web Audio API for microphone access
- **Real-time UI Updates**: Live participant list and status updates
- **LAN IP Detection**: Automatically detects and displays local IP
- **Connection Status**: Shows server connection status
- **Audio Controls**: Mute, recording, and volume controls

### Network Configuration
- **Default Port**: 3001 (configurable)
- **Protocol**: HTTP/WebSocket for signaling, UDP for audio
- **Encryption**: XOR encryption with 32-byte keys
- **Audio Format**: 44.1kHz, 16-bit, mono PCM

## API Endpoints

- `GET /api/server-info` - Server information and status
- `GET /api/participants` - List of connected participants
- `GET /api/connection-logs` - Connection history
- `GET /api/recordings` - List of saved recordings

## Socket.IO Events

### Client to Server
- `join-conference` - Join the conference
- `audio-data` - Send audio data
- `toggle-mute` - Mute/unmute microphone
- `toggle-recording` - Start/stop recording

### Server to Client
- `server-info` - Server configuration
- `participants-list` - Current participants
- `participant-joined` - New participant joined
- `participant-left` - Participant disconnected
- `audio-stream` - Incoming audio data
- `speech-activity` - Speaking status updates
- `recording-status` - Recording state changes

## Security Features

- **Audio Encryption**: All audio packets are encrypted using XOR
- **Connection Validation**: Server validates all connections
- **IP Logging**: All connections are logged with IP addresses
- **Secure Audio Processing**: Audio data is processed securely

## Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Check if port 3001 is available
   - Ensure Node.js is installed
   - Run `npm install` in server directory

2. **Audio Not Working**
   - Check browser permissions for microphone
   - Ensure HTTPS in production (required for WebRTC)
   - Check browser console for errors

3. **Connection Issues**
   - Verify server is running
   - Check firewall settings
   - Ensure correct IP address and port

4. **Recording Not Saving**
   - Check server permissions for recordings directory
   - Ensure sufficient disk space
   - Check server logs for errors

## Development

### Adding New Features
1. Update backend in `server/server.js`
2. Add corresponding frontend logic in `src/hooks/useAudioService.ts`
3. Update UI components as needed

### Testing
- Test with multiple browser tabs/windows
- Test on different devices on the same network
- Verify recording functionality
- Test mute/unmute features

## License

MIT License - Feel free to use and modify as needed.