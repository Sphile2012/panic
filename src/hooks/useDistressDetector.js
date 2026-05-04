import { useEffect, useRef, useCallback } from "react";

const HIGH_DECIBEL_THRESHOLD = -20; // dBFS — sustained loud sound
const SUSTAINED_MS = 1500; // must stay loud for 1.5s
const COOLDOWN_MS = 15000; // 15s between triggers

/**
 * Listens on the microphone while `active` is true.
 * Calls `onDistressDetected(reason)` when:
 *  - Sustained high-decibel audio is detected (screaming, alarm)
 *  - SpeechRecognition picks up the keyword "help"
 */
export default function useDistressDetector({ active, onDistressDetected }) {
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const loudStartRef = useRef(null);
  const lastTriggerRef = useRef(0);
  const recognitionRef = useRef(null);

  const triggerDistress = useCallback((reason) => {
    const now = Date.now();
    if (now - lastTriggerRef.current < COOLDOWN_MS) return;
    lastTriggerRef.current = now;
    onDistressDetected?.(reason);
  }, [onDistressDetected]);

  // --- Volume analysis loop ---
  const startVolumeMonitor = useCallback((stream) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Float32Array(analyser.fftSize);

    const loop = () => {
      analyser.getFloatTimeDomainData(data);
      // Compute RMS in dBFS
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

      if (db > HIGH_DECIBEL_THRESHOLD) {
        if (!loudStartRef.current) loudStartRef.current = Date.now();
        else if (Date.now() - loudStartRef.current >= SUSTAINED_MS) {
          loudStartRef.current = null;
          triggerDistress("high_decibel");
        }
      } else {
        loudStartRef.current = null;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [triggerDistress]);

  // --- Keyword detection via SpeechRecognition ---
  const startSpeechRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (/\bhelp\b|\bsos\b|\bemergency\b/.test(transcript)) {
          triggerDistress("keyword");
        }
      }
    };

    recognition.onerror = () => {};
    recognition.onend = () => {
      // Auto-restart if still active
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch {}
      }
    };

    try { recognition.start(); } catch {}
    recognitionRef.current = recognition;
  }, [triggerDistress]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    loudStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }

    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      startVolumeMonitor(stream);
      startSpeechRecognition();
    }).catch(() => {});

    return () => { cancelled = true; stop(); };
  }, [active, startVolumeMonitor, startSpeechRecognition, stop]);
}