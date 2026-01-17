import { useState, useCallback, useEffect, useRef } from "react";
import { Personality } from "@/lib/types";

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      synthesisRef.current = speechSynthesis;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported && !isListening) {
      setTranscript("");
      recognitionRef.current.start();
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const speak = useCallback((text: string, personality?: Personality) => {
    if (synthesisRef.current && isSupported) {
      // Stop any ongoing speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Adjust voice characteristics based on Marvel personality
      switch (personality) {
        case 'spiderman':
          utterance.pitch = 1.3;
          utterance.rate = 1.2;
          break;
        case 'ironman':
          utterance.pitch = 1.0;
          utterance.rate = 1.1;
          break;
        case 'captain':
          utterance.pitch = 0.9;
          utterance.rate = 0.9;
          break;
        case 'thor':
          utterance.pitch = 0.8;
          utterance.rate = 0.85;
          break;
        case 'hulk':
          utterance.pitch = 0.7;
          utterance.rate = 0.8;
          break;
        case 'widow':
          utterance.pitch = 1.1;
          utterance.rate = 1.0;
          break;
        default:
          utterance.pitch = 1.0;
          utterance.rate = 1.0;
      }

      synthesisRef.current.speak(utterance);
    }
  }, [isSupported]);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}

// TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}