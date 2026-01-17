import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { useVoice } from "@/hooks/useVoice";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const { 
    isListening, 
    isSupported, 
    transcript, 
    startListening, 
    stopListening
  } = useVoice();

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Handle transcript changes when listening stops
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={className} data-testid="voice-controls">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVoiceToggle}
        className={`glass-effect hover:bg-white/20 transition-all duration-200 ${
          isListening ? 'bg-red-500/30 border-red-400' : 'bg-white/10 border-white/20'
        }`}
        data-testid="button-voice-input"
      >
        {isListening ? (
          <MicOff className="w-4 h-4 text-red-400" />
        ) : (
          <Mic className="w-4 h-4 text-white" />
        )}
      </Button>
    </div>
  );
}
