import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Volume2,
  LogOut,
  Settings,
  Radio,
  Users,
  Circle,
  Wifi,
  Shield,
  Activity,
  BarChart3,
  X,
} from "lucide-react";
import ParticipantCard from "./ParticipantCard";
import SettingsPanel from "./SettingsPanel";
import PacketLossDashboard from "./PacketLossDashboard";
import { useAudioService } from "@/hooks/useAudioService";

interface ConferenceDashboardProps {
  username: string;
  host: string;
  port: string;
  onLeave: () => void;
}

const ConferenceDashboard = ({ username, host, port, onLeave }: ConferenceDashboardProps) => {
  const [volume, setVolume] = useState([75]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [systemMessages, setSystemMessages] = useState([
    { id: 1, text: `${username} joined the conference`, time: "Just now" },
    { id: 2, text: "Connection established via UDP", time: "Just now" },
  ]);

  const serverUrl = `http://${host}:${port}`;
  
  const {
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
  } = useAudioService({
    serverUrl,
    username
  });

  // Initialize connection and audio capture
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Start audio capture when connected
  useEffect(() => {
    if (isConnected) {
      startAudioCapture().catch(console.error);
    }
    return () => {
      stopAudioCapture();
    };
  }, [isConnected, startAudioCapture, stopAudioCapture]);

  // Update system messages with connection logs
  useEffect(() => {
    if (connectionLogs.length > 0) {
      const latestLog = connectionLogs[connectionLogs.length - 1];
      setSystemMessages(prev => [
        { 
          id: Date.now(), 
          text: `${latestLog.username || 'User'} ${latestLog.action}`, 
          time: "Just now" 
        },
        ...prev.slice(0, 9) // Keep only last 10 messages
      ]);
    }
  }, [connectionLogs]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLeave = () => {
    disconnect();
    onLeave();
  };

  // Helper function to get avatar for participant
  const getAvatarForParticipant = (participantName: string) => {
    const avatars = [
      "/src/assets/avatar-boy.jpg",
      "/src/assets/avatar-girl.jpg", 
      "/src/assets/avatar-woman-1.webp",
      "/src/assets/avatar-boy-2.webp",
      "/src/assets/avatar-boy-3.jpg",
      "/src/assets/avatar-girls.jpg",
      "/src/assets/avatar-woman-2.jpg"
    ];
    
    // Simple hash-based avatar selection
    let hash = 0;
    for (let i = 0; i < participantName.length; i++) {
      hash = participantName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatars[Math.abs(hash) % avatars.length];
  };

  return (
    <div className="min-h-screen w-full p-6" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-full animate-pulse-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Audio Conference Room</h1>
                <p className="text-sm text-muted-foreground">UDP Real-Time Communication</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isRecording && (
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 border-destructive text-destructive animate-pulse-active"
                >
                  <Circle className="w-3 h-3 mr-2 fill-destructive" />
                  Recording {formatRecordingTime(recordingTime)}
                </Badge>
              )}
              <Badge variant="outline" className="px-3 py-1">
                <Users className="w-4 h-4 mr-2" />
                {participants.length} Connected
              </Badge>
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className="px-3 py-1"
              >
                <Wifi className="w-4 h-4 mr-2" />
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {serverInfo?.encryptionEnabled && (
                <Badge variant="outline" className="px-3 py-1">
                  <Shield className="w-4 h-4 mr-2" />
                  Encrypted
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="border-2"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant={showMetrics ? "default" : "outline"}
                size="icon"
                onClick={() => setShowMetrics(!showMetrics)}
                className="border-2"
                title="Network Metrics Dashboard"
                style={showMetrics ? { background: "var(--gradient-primary)" } : {}}
              >
                {showMetrics ? (
                  <X className="w-4 h-4" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Conference Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants Grid */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Participants
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <ParticipantCard 
                    key={participant.id}
                    name={participant.username}
                    avatar={getAvatarForParticipant(participant.username)}
                    isSpeaking={participant.isSpeaking}
                    isMuted={participant.isMuted}
                    connectionStrength={participant.connectionStrength}
                    isCurrentUser={participant.username === username}
                  />
                ))}
                {participants.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No participants connected</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Controls */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Controls</h2>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "default"}
                  onClick={toggleMute}
                  className="flex-1 min-w-[140px]"
                  style={!isMuted ? { background: "var(--gradient-primary)" } : {}}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="mr-2 h-5 w-5" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Mute
                    </>
                  )}
                </Button>

                <div className="flex-1 min-w-[200px] flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{volume[0]}%</span>
                </div>

                <Button
                  size="lg"
                  variant={isRecording ? "default" : "outline"}
                  onClick={toggleRecording}
                  className={`flex-1 min-w-[140px] ${isRecording ? "border-2 animate-pulse-glow" : "border-2"}`}
                  style={isRecording ? { background: "var(--gradient-primary)", boxShadow: "var(--glow-active)" } : {}}
                >
                  <Circle className={`mr-2 h-4 w-4 ${isRecording ? "fill-white animate-pulse" : ""}`} />
                  {isRecording ? "Stop Recording" : "Record Session 🎙️"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLeave}
                  className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Leave
                </Button>
              </div>
            </Card>
          </div>

          {/* System Messages & Settings */}
          <div className="space-y-6">
            {showSettings ? (
              <SettingsPanel onClose={() => setShowSettings(false)} />
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Connection Logs
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {connectionLogs.slice(-10).reverse().map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{log.username || 'Unknown User'}</p>
                        <Badge 
                          variant={log.action === 'joined' ? 'default' : log.action === 'disconnected' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {log.ip} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                  {connectionLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No connection logs yet</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* UDP Connection Diagram */}
            <Card className="p-6 border-2 border-secondary/30">
              <h3 className="text-sm font-semibold mb-3 text-secondary">
                Real-Time UDP Connection
              </h3>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs">Clients</p>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 bg-secondary/50 rounded animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-xs">Server</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Packet Loss Visualization Dashboard */}
        {showMetrics && (
          <PacketLossDashboard 
            metrics={networkMetrics} 
            currentMetrics={currentMetrics} 
          />
        )}
      </div>
    </div>
  );
};

export default ConferenceDashboard;
