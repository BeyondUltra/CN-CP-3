import { Mic, MicOff, Signal } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ParticipantCardProps {
  name: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  connectionStrength: "good" | "medium" | "poor";
  isCurrentUser?: boolean;
}

const ParticipantCard = ({
  name,
  avatar,
  isSpeaking,
  isMuted,
  connectionStrength,
  isCurrentUser = false,
}: ParticipantCardProps) => {
  const getConnectionColor = () => {
    switch (connectionStrength) {
      case "good":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
    }
  };

  return (
    <Card
      className={`p-4 transition-all duration-300 hover:scale-105 ${
        isSpeaking ? "animate-pulse-active border-green-500" : "border-border"
      } ${isCurrentUser ? "border-2 border-primary" : ""}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div
            className={`w-20 h-20 rounded-full overflow-hidden border-4 transition-all ${
              isSpeaking ? "border-green-400 shadow-lg" : "border-border"
            }`}
            style={isSpeaking ? { boxShadow: "var(--glow-active)" } : {}}
          >
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 border-2 border-border">
            {isMuted ? (
              <MicOff className="w-4 h-4 text-destructive" />
            ) : (
              <Mic className={`w-4 h-4 ${isSpeaking ? "text-green-500" : "text-muted-foreground"}`} />
            )}
          </div>
        </div>

        <div className="text-center w-full">
          <p className="font-semibold text-sm truncate">
            {name} {isCurrentUser && "(You)"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Signal className={`w-3 h-3 ${getConnectionColor()}`} />
            <span className="text-xs text-muted-foreground capitalize">{connectionStrength}</span>
          </div>
        </div>

        {isSpeaking && !isMuted && (
          <div className="flex gap-1 h-8 items-end">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-500 rounded-full animate-wave"
                style={{
                  height: `${20 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ParticipantCard;
