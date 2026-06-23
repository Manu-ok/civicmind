"use client";

import { useState, useEffect } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function useVoice() {
  const { 
    transcript, 
    interimTranscript,
    listening, 
    resetTranscript, 
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();
  
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setError("Browser doesn't support speech recognition. Please use Google Chrome.");
      return;
    }
    setError(null);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });

    // Auto stop after 30 seconds
    const newTimer = setTimeout(() => {
      stopListening();
    }, 30000);
    setTimer(newTimer);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    if (timer) clearTimeout(timer);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
      SpeechRecognition.stopListening();
    };
  }, [timer]);

  return {
    transcript,
    interimTranscript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported: browserSupportsSpeechRecognition,
  };
}
