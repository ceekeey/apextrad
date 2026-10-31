import { useCallback, useEffect, useRef, useState } from "react";

export const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const formatSpeechDuration = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const useSpeechRecognition = ({
  lang = "en-US",
  continuous = true,
  interimResults = true,
  onFinalTranscript,
} = {}) => {
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const lastFinalTranscriptRef = useRef("");

  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState("idle");
  const [language, setLanguage] = useState(lang);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    const startedAt = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
  }, [clearTimer]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch {
        // No-op: the browser can reject stopping a recognition instance in a transient state.
      }
    }

    setIsListening(false);
    setInterimTranscript("");
    setStatus("completed");
    clearTimer();
  }, [clearTimer, isListening]);

  const clearTranscript = useCallback(() => {
    lastFinalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setStatus("idle");
    setError("");
    setElapsedSeconds(0);
  }, []);

  const ensureRecognition = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setSupported(false);
      setStatus("unsupported");
      setError("Speech recognition is not supported in this browser.");
      return null;
    }

    if (!recognitionRef.current) {
      const instance = new Recognition();
      instance.continuous = continuous;
      instance.interimResults = interimResults;
      instance.lang = language;
      instance.maxAlternatives = 1;

      instance.onstart = () => {
        setStatus("listening");
        setIsListening(true);
        setError("");
        setElapsedSeconds(0);
        startTimer();
      };

      instance.onresult = (event) => {
        const finalSegments = [];
        const interimSegments = [];

        Array.from(event.results).forEach((result) => {
          const text = result[0]?.transcript?.trim();
          if (!text) return;

          if (result.isFinal) {
            finalSegments.push(text);
            return;
          }

          interimSegments.push(text);
        });

        if (interimSegments.length > 0) {
          setInterimTranscript(
            interimSegments[interimSegments.length - 1]
              .replace(/\s+/g, " ")
              .trim(),
          );
        } else {
          setInterimTranscript("");
        }

        if (finalSegments.length > 0) {
          const finalText = finalSegments.join(" ").replace(/\s+/g, " ").trim();
          if (!finalText) return;

          const normalizedFinalText = finalText.replace(/\s+/g, " ").trim();
          if (normalizedFinalText === lastFinalTranscriptRef.current) {
            return;
          }

          lastFinalTranscriptRef.current = normalizedFinalText;
          setTranscript((previous) => {
            const next = previous
              ? `${previous} ${normalizedFinalText}`
              : normalizedFinalText;
            onFinalTranscript?.(normalizedFinalText, next);
            return next;
          });
        }
      };

      instance.onerror = (event) => {
        const errorCode = event?.error ?? "unknown";
        setIsListening(false);
        clearTimer();

        if (["not-allowed", "permission-denied"].includes(errorCode)) {
          setStatus("permission-denied");
          setError(
            "Microphone permission was denied. Please allow access and try again.",
          );
          return;
        }

        if (errorCode === "network") {
          setStatus("error");
          setError(
            "Speech recognition could not reach the browser recognition service.",
          );
          return;
        }

        setStatus("error");
        setError("Speech recognition encountered an error. Please try again.");
      };

      instance.onend = () => {
        setIsListening(false);
        clearTimer();
        setInterimTranscript("");

        if (status !== "permission-denied" && status !== "error") {
          setStatus("completed");
        }
      };

      recognitionRef.current = instance;
    }

    setSupported(true);
    return recognitionRef.current;
  }, [
    clearTimer,
    continuous,
    interimResults,
    language,
    onFinalTranscript,
    startTimer,
    status,
  ]);

  const startListening = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setSupported(false);
      setStatus("unsupported");
      setError("This browser does not support speech recognition.");
      return false;
    }

    const recognition = ensureRecognition();
    if (!recognition) {
      return false;
    }

    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    setStatus("processing");
    setError("");
    setInterimTranscript("");

    try {
      recognition.start();
      return true;
    } catch {
      setStatus("processing");
      setIsListening(true);
      startTimer();
      return true;
    }
  }, [continuous, ensureRecognition, interimResults, language, startTimer]);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(
    () => () => {
      clearTimer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // No-op during unmount cleanup.
        }
      }
    },
    [clearTimer],
  );

  return {
    supported,
    status,
    transcript,
    interimTranscript,
    error,
    isListening,
    language,
    elapsedSeconds,
    startListening,
    stopListening,
    clearTranscript,
    setLanguage,
  };
};
