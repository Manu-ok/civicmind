"use client";

import { useState, useEffect } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function useVoice() {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Browser doesn't support speech recognition.");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });

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
    listening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: browserSupportsSpeechRecognition,
  };
}
