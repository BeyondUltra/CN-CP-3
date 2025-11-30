import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Mic,
  Volume2,
  Radio,
  Wand2,
  Volume1,
  MessageSquare,
  Circle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const [username, setUsername] = useState("Samruddhi");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [voiceDetection, setVoiceDetection] = useState(true);
  const [recordSession, setRecordSession] = useState(false);
  const [whisperMode, setWhisperMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(65);

  return (
    <Card className="p-6 border-2 border-primary/20 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Settings & Features</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="settings-username">Username</Label>
          <Input
            id="settings-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2"
          />
        </div>

        {/* Audio Devices */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            Input Device
          </Label>
          <select className="w-full p-2 rounded-lg border-2 border-input bg-background">
            <option>Default Microphone</option>
            <option>External Microphone</option>
            <option>Built-in Microphone</option>
          </select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            Output Device
          </Label>
          <select className="w-full p-2 rounded-lg border-2 border-input bg-background">
            <option>Default Speakers</option>
            <option>Headphones</option>
            <option>External Speakers</option>
          </select>
        </div>

        {/* Audio Level Meter */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>Audio Level</span>
            <Badge variant="secondary">{audioLevel}%</Badge>
          </Label>
          <Progress value={audioLevel} className="h-3" />
          <div className="flex gap-1 h-12 items-end justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-2 rounded-full animate-wave"
                style={{
                  height: `${audioLevel * 0.4 + Math.random() * 10}px`,
                  background: audioLevel > 70 ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Features Toggle */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Audio Features
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="noise-reduction" className="cursor-pointer">
                Noise Reduction
              </Label>
            </div>
            <Switch
              id="noise-reduction"
              checked={noiseReduction}
              onCheckedChange={setNoiseReduction}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume1 className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="echo-cancel" className="cursor-pointer">
                Echo Cancellation
              </Label>
            </div>
            <Switch
              id="echo-cancel"
              checked={echoCancellation}
              onCheckedChange={setEchoCancellation}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="voice-detection" className="cursor-pointer">
                Voice Activity Detection
              </Label>
            </div>
            <Switch
              id="voice-detection"
              checked={voiceDetection}
              onCheckedChange={setVoiceDetection}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-destructive" />
              <Label htmlFor="record" className="cursor-pointer">
                Record Session
              </Label>
            </div>
            <Switch
              id="record"
              checked={recordSession}
              onCheckedChange={setRecordSession}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="whisper" className="cursor-pointer">
                Whisper Mode
              </Label>
            </div>
            <Switch
              id="whisper"
              checked={whisperMode}
              onCheckedChange={setWhisperMode}
            />
          </div>
        </div>

        {/* Voice Filters */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold text-sm">Voice Filters 🎭</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm">
              🤖 Robot
            </Button>
            <Button variant="outline" size="sm">
              🌸 Soft
            </Button>
            <Button variant="outline" size="sm">
              🎺 Deep
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
