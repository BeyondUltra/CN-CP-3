import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Radio, Wifi, Server, AlertCircle } from "lucide-react";

interface WelcomePageProps {
  onJoin: (username: string, host: string, port: string) => void;
}

const WelcomePage = ({ onJoin }: WelcomePageProps) => {
  const [username, setUsername] = useState("");
  // Auto-detect host from current location or use empty string
  const getDefaultHost = () => {
    // If deployed (not localhost), use current hostname
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.hostname;
    }
    // For local development, start with empty string (will auto-detect)
    return "";
  };
  const [host, setHost] = useState(getDefaultHost());
  const [port, setPort] = useState("3001");
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [localIP, setLocalIP] = useState<string>("");

  // Detect local IP and check server status
  useEffect(() => {
    const detectLocalIP = async () => {
      try {
        // Try to get local IP through WebRTC
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (ipMatch && !ipMatch[1].startsWith('127.')) {
              setLocalIP(ipMatch[1]);
            }
          }
        };
        
        // Try to connect to server - use multiple strategies
        setTimeout(async () => {
          const tryConnect = async (serverHost: string) => {
            try {
              const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
              const url = `${protocol}//${serverHost}:${port}/api/server-info`;
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                setServerInfo(data);
                setServerStatus('online');
                
                // Use the clientServerUrl from server if available, otherwise use detected IP
                if (data.clientServerUrl) {
                  const urlObj = new URL(data.clientServerUrl);
                  setHost(urlObj.hostname);
                  setLocalIP(urlObj.hostname);
                } else if (data.serverIP && data.serverIP !== 'localhost') {
                  setLocalIP(data.serverIP);
                  if (!host) {
                    setHost(data.serverIP);
                  }
                } else if (serverHost) {
                  setHost(serverHost);
                  setLocalIP(serverHost);
                }
                return true;
              }
            } catch (error) {
              console.log(`Failed to connect to ${serverHost}:`, error);
            }
            return false;
          };

          // Strategy 1: Try current hostname (for deployed apps)
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            if (await tryConnect(window.location.hostname)) {
              return;
            }
          }

          // Strategy 2: Try provided host
          if (host && await tryConnect(host)) {
            return;
          }

          // Strategy 3: Try localhost
          if (await tryConnect('localhost')) {
            return;
          }

          // Strategy 4: Try detected local IP
          if (localIP && await tryConnect(localIP)) {
            return;
          }

          // All strategies failed
          setServerStatus('offline');
        }, 2000);
        
      } catch (error) {
        console.error('Error detecting local IP:', error);
        setServerStatus('offline');
      }
    };

    detectLocalIP();
  }, [host, port]);

  const handleJoin = () => {
    if (username.trim() && serverStatus === 'online') {
      onJoin(username, host, port);
    }
  };

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHost(e.target.value);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPort(e.target.value);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: "var(--gradient-soft)" }}>
      <Card className="w-full max-w-md p-8 animate-fade-in border-2 border-primary/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-pulse-glow" style={{ background: "var(--gradient-primary)" }}>
            <Headphones className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Audio Conference
          </h1>
          <p className="text-muted-foreground">UDP Real-Time Communication</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 focus:border-primary transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host" className="text-sm font-medium">
                Server Host
              </Label>
              <Input
                id="host"
                value={host}
                onChange={handleHostChange}
                className="border-2 focus:border-primary transition-all text-lg"
                placeholder="Enter server hostname or IP (e.g., localhost, your-server.onrender.com)"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                💡 Type your server's IP address here
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="text-sm font-medium">
                Server Port
              </Label>
              <Input
                id="port"
                value={port}
                onChange={handlePortChange}
                className="border-2 focus:border-primary transition-all"
                placeholder="3001"
              />
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!username.trim() || serverStatus !== 'online'}
            className="w-full h-12 text-lg font-semibold transition-all hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Headphones className="mr-2 h-5 w-5" />
            {serverStatus === 'online' ? 'Join Conference 🎧' : 'Server Offline'}
          </Button>

          {/* Server Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Server Status</span>
              </div>
              <Badge 
                variant={serverStatus === 'online' ? 'default' : serverStatus === 'checking' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {serverStatus === 'online' && '🟢 Online'}
                {serverStatus === 'checking' && '🟡 Checking...'}
                {serverStatus === 'offline' && '🔴 Offline'}
              </Badge>
            </div>

            {localIP && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Detected Local IP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm font-mono bg-white">
                    {localIP}
                  </Badge>
                  <span className="text-xs text-blue-600">
                    Copy this IP and paste it in the Server Host field above
                  </span>
                </div>
              </div>
            )}

            {serverInfo && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Participants</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {serverInfo.participantsCount || 0} connected
                </Badge>
              </div>
            )}

            {serverStatus === 'offline' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-destructive font-medium">Server not available</p>
                  <p className="text-destructive/80 text-xs mt-1">
                    Make sure the backend server is running on {host}:{port}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomePage;