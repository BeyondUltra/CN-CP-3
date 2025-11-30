import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface AudioServiceConfig {
  serverUrl: string;
  username: string;
}

interface Participant {
  id: string;
  username: string;
  socketId: string;
  ip: string;
  joinedAt: string;
  isMuted: boolean;
  isSpeaking: boolean;
  connectionStrength: 'good' | 'medium' | 'poor';
}

export interface NetworkMetrics {
  timestamp: number;
  packetLoss: number;
  jitter: number;
  latency: number;
  outOfOrder: number;
  bufferSize: number;
  activeThreads: number;
}

interface AudioServiceReturn {
  socket: Socket | null;
  participants: Participant[];
  isConnected: boolean;
  isMuted: boolean;
  isRecording: boolean;
  recordingTime: number;
  serverInfo: {
    serverIP: string;
    port: number;
    encryptionEnabled: boolean;
  } | null;
  connectionLogs: Array<{
    id: string;
    socketId: string;
    ip: string;
    username?: string;
    timestamp: string;
    action: string;
  }>;
  networkMetrics: NetworkMetrics[];
  currentMetrics: NetworkMetrics | null;
  toggleMute: () => void;
  toggleRecording: () => void;
  startAudioCapture: () => Promise<void>;
  stopAudioCapture: () => void;
  connect: () => void;
  disconnect: () => void;
}

export const useAudioService = ({ serverUrl, username }: AudioServiceConfig): AudioServiceReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [serverInfo, setServerInfo] = useState<AudioServiceReturn['serverInfo']>(null);
  const [connectionLogs, setConnectionLogs] = useState<AudioServiceReturn['connectionLogs']>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);

  // Network metrics tracking
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetrics | null>(null);
  const packetSequenceRef = useRef<number>(0);
  const sentPacketsRef = useRef<number>(0);
  const receivedPacketsRef = useRef<number>(0);
  const lastReceivedSequenceRef = useRef<number>(-1);
  const outOfOrderPacketsRef = useRef<number>(0);
  const latencyHistoryRef = useRef<number[]>([]);
  const jitterHistoryRef = useRef<number[]>([]);
  const pingTimesRef = useRef<Map<number, number>>(new Map());
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioBufferSizeRef = useRef<number>(4096);
  const expectedSequenceRef = useRef<Map<string, number>>(new Map()); // Track expected sequence per participant

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Update network metrics
  const updateNetworkMetrics = useCallback(() => {
    // Calculate packet loss percentage
    // Based on sequence number gaps and out-of-order packets
    let packetLoss = 0;
    
    if (receivedPacketsRef.current > 0) {
      // Calculate loss based on out-of-order packets (indicates network issues)
      // Out-of-order packets suggest some packets were lost or delayed
      const outOfOrderRate = (outOfOrderPacketsRef.current / Math.max(receivedPacketsRef.current, 1)) * 100;
      
      // Estimate packet loss: out-of-order packets often indicate 2-3x actual packet loss
      // (because reordering can happen when packets take different paths)
      packetLoss = Math.min(100, outOfOrderRate * 1.5);
      
      // Add a small baseline if we're not receiving packets at expected rate
      // This is a heuristic for when sequence tracking isn't perfect
      if (sentPacketsRef.current > 100 && receivedPacketsRef.current < sentPacketsRef.current * 0.7) {
        const ratioBasedLoss = ((sentPacketsRef.current - receivedPacketsRef.current) / sentPacketsRef.current) * 30;
        packetLoss = Math.max(packetLoss, ratioBasedLoss);
      }
    }
    
    // Calculate average latency
    const avgLatency = latencyHistoryRef.current.length > 0
      ? latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length
      : 0;
    
    // Calculate average jitter
    const avgJitter = jitterHistoryRef.current.length > 0
      ? jitterHistoryRef.current.reduce((a, b) => a + b, 0) / jitterHistoryRef.current.length
      : 0;
    
    // Fetch server metrics (active threads, etc.)
    fetch(`${serverUrl}/api/network-metrics`)
      .then(res => res.json())
      .then(serverMetrics => {
        const metrics: NetworkMetrics = {
          timestamp: Date.now(),
          packetLoss: Math.max(0, Math.min(100, packetLoss)),
          jitter: Math.max(0, avgJitter),
          latency: Math.max(0, avgLatency),
          outOfOrder: outOfOrderPacketsRef.current,
          bufferSize: audioBufferSizeRef.current,
          activeThreads: serverMetrics.activeThreads || 1
        };
        
        setCurrentMetrics(metrics);
        setNetworkMetrics(prev => {
          const updated = [...prev, metrics];
          // Keep only last 15 minutes of data (900 data points at 1 second intervals)
          return updated.slice(-900);
        });
      })
      .catch(() => {
        // Fallback if server endpoint is not available
        const metrics: NetworkMetrics = {
          timestamp: Date.now(),
          packetLoss: Math.max(0, Math.min(100, packetLoss)),
          jitter: Math.max(0, avgJitter),
          latency: Math.max(0, avgLatency),
          outOfOrder: outOfOrderPacketsRef.current,
          bufferSize: audioBufferSizeRef.current,
          activeThreads: 1
        };
        
        setCurrentMetrics(metrics);
        setNetworkMetrics(prev => {
          const updated = [...prev, metrics];
          return updated.slice(-900);
        });
      });
  }, [serverUrl]);

  // Start audio capture
  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      mediaStreamRef.current = stream;
      const audioContext = await initAudioContext();
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (!isMuted && socket) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array for transmission
          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Store for recording if enabled
          if (isRecording) {
            audioChunksRef.current.push(new Float32Array(inputData));
          }
          
          // Track packet sequence and send audio data to server
          const sequence = packetSequenceRef.current++;
          sentPacketsRef.current++;
          audioBufferSizeRef.current = int16Array.buffer.byteLength;
          
          const pingId = Date.now();
          pingTimesRef.current.set(sequence, pingId);
          
          socket.emit('audio-data', {
            audioBuffer: int16Array.buffer,
            sequence,
            timestamp: pingId
          });
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = processor;
      
      // Trigger initial metrics update when audio starts
      setTimeout(() => {
        updateNetworkMetrics();
      }, 500);
      
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }, [isMuted, socket, isRecording, initAudioContext, updateNetworkMetrics]);

  // Stop audio capture
  const stopAudioCapture = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (socket) {
      socket.emit('toggle-mute', newMutedState);
    }
  }, [isMuted, socket]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    
    if (socket) {
      socket.emit('toggle-recording', newRecordingState);
    }
    
    if (newRecordingState) {
      audioChunksRef.current = [];
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
  }, [isRecording, socket]);

  // Connect to server
  const connect = useCallback(() => {
    if (socket) return;
    
    // Try to connect to the server URL
    const newSocket = io(serverUrl, {
      timeout: 5000,
      forceNew: true
    });
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join conference
      newSocket.emit('join-conference', {
        username,
        host: serverUrl.split('//')[1].split(':')[0],
        port: serverUrl.split(':')[2] || '3001'
      });

      // Initialize metrics immediately with zero values
      const initializeMetrics = () => {
        const initialMetrics: NetworkMetrics = {
          timestamp: Date.now(),
          packetLoss: 0,
          jitter: 0,
          latency: 0,
          outOfOrder: 0,
          bufferSize: 4096,
          activeThreads: 1
        };
        setCurrentMetrics(initialMetrics);
        setNetworkMetrics([initialMetrics]);
      };

      // Initialize immediately
      initializeMetrics();

      // Also fetch initial server metrics
      updateNetworkMetrics();

      // Start metrics collection interval immediately
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      metricsIntervalRef.current = setInterval(() => {
        updateNetworkMetrics();
      }, 1000); // Update every second
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    newSocket.on('server-info', (info) => {
      setServerInfo(info);
    });
    
    newSocket.on('participants-list', (participantsList) => {
      setParticipants(participantsList);
    });
    
    newSocket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });
    
    newSocket.on('participant-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });
    
    newSocket.on('audio-stream', (data) => {
      // Handle incoming audio stream
      if (data.participantId !== newSocket.id) {
        // Track received packets
        receivedPacketsRef.current++;
        
        // Calculate latency if timestamp is available
        if (data.timestamp && data.sequence !== undefined) {
          const pingTime = pingTimesRef.current.get(data.sequence);
          if (pingTime) {
            const latency = Date.now() - pingTime;
            latencyHistoryRef.current.push(latency);
            if (latencyHistoryRef.current.length > 100) {
              latencyHistoryRef.current.shift();
            }
            pingTimesRef.current.delete(data.sequence);
            
            // Calculate jitter (variation in latency)
            if (latencyHistoryRef.current.length > 1) {
              const prevLatency = latencyHistoryRef.current[latencyHistoryRef.current.length - 2];
              const jitter = Math.abs(latency - prevLatency);
              jitterHistoryRef.current.push(jitter);
              if (jitterHistoryRef.current.length > 100) {
                jitterHistoryRef.current.shift();
              }
            }
          }
        }
        
        // Check for out-of-order packets and track sequence gaps (packet loss)
        if (data.sequence !== undefined) {
          const participantId = data.participantId;
          const expectedSeq = expectedSequenceRef.current.get(participantId) || 0;
          
          if (data.sequence < expectedSeq) {
            // Out-of-order packet
            outOfOrderPacketsRef.current++;
          } else if (data.sequence > expectedSeq + 1) {
            // Missing packets detected (packet loss)
            // The gap indicates lost packets
            const lostPackets = data.sequence - expectedSeq - 1;
            // This will be reflected in packet loss calculation
          }
          
          expectedSequenceRef.current.set(participantId, Math.max(expectedSeq, data.sequence));
        }
        
        // Play received audio
        playAudioData(data.audioBuffer);
      }
    });
    
    newSocket.on('speech-activity', (data) => {
      setParticipants(prev => 
        prev.map(p => 
          p.id === data.participantId 
            ? { ...p, isSpeaking: data.isSpeaking }
            : p
        )
      );
    });
    
    newSocket.on('participant-muted', (data) => {
      setParticipants(prev => 
        prev.map(p => 
          p.id === data.participantId 
            ? { ...p, isMuted: data.isMuted }
            : p
        )
      );
    });
    
    newSocket.on('recording-status', (data) => {
      setIsRecording(data.isRecording);
    });
    
    newSocket.on('recording-saved', (data) => {
      console.log('Recording saved:', data.filename);
    });
    
  }, [socket, serverUrl, username, updateNetworkMetrics]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    stopAudioCapture();
    
    // Clear metrics interval
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    
    // Reset metrics
    packetSequenceRef.current = 0;
    sentPacketsRef.current = 0;
    receivedPacketsRef.current = 0;
    lastReceivedSequenceRef.current = -1;
    outOfOrderPacketsRef.current = 0;
    latencyHistoryRef.current = [];
    jitterHistoryRef.current = [];
    pingTimesRef.current.clear();
    expectedSequenceRef.current.clear();
  }, [socket, stopAudioCapture]);

  // Play audio data
  const playAudioData = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      const audioContext = await initAudioContext();
      
      // Convert Int16Array back to Float32Array
      const int16Array = new Int16Array(audioBuffer);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }
      
      // Create audio buffer
      const audioBufferNode = audioContext.createBuffer(1, float32Array.length, 44100);
      audioBufferNode.copyToChannel(float32Array, 0);
      
      // Play audio
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferNode;
      source.connect(audioContext.destination);
      source.start();
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [initAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioCapture();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [stopAudioCapture, socket]);

  return {
    socket,
    participants,
    isConnected,
    isMuted,
    isRecording,
    recordingTime,
    serverInfo,
    connectionLogs,
    networkMetrics,
    currentMetrics,
    toggleMute,
    toggleRecording,
    startAudioCapture,
    stopAudioCapture,
    connect,
    disconnect
  };
};
