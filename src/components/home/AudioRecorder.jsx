import { useState, useRef } from "react";
import { Mic, Square, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioRecorder({ onRecordingComplete }) {
  const [state, setState] = useState("idle"); // idle | recording | processing | done | error
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = handleProcess;
      mediaRecorder.start();

      setState("recording");
      setDuration(0);
      setAudioUrl(null);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      setState("error");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleProcess = () => {
    setState("processing");
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      // Create a local object URL — in production you'd upload to your own storage
      const localUrl = URL.createObjectURL(blob);
      setAudioUrl(localUrl);
      setState("done");
      onRecordingComplete?.(localUrl);
    } catch {
      setState("error");
    }
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setState("idle");
    setDuration(0);
    setAudioUrl(null);
    onRecordingComplete?.(null);
  };

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${
      state === "recording" ? "bg-red-500/10 border-red-500/30" :
      state === "done" ? "bg-emerald-500/10 border-emerald-500/30" :
      "bg-white/[0.03] border-white/[0.07]"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic size={16} className={state === "recording" ? "text-red-400" : state === "done" ? "text-emerald-400" : "text-[#666]"} />
          <h3 className="text-white font-semibold text-sm">Emergency Audio</h3>
        </div>
        {state === "recording" && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-400 text-xs font-mono">{formatTime(duration)}</span>
          </motion.div>
        )}
        {state === "done" && (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs">Ready</span>
          </div>
        )}
      </div>

      {(state === "idle" || state === "error") && (
        <>
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors text-sm"
          >
            <Mic size={16} />
            Start Emergency Recording
          </button>
          {state === "error" && (
            <p className="text-red-400 text-xs mt-2 text-center flex items-center justify-center gap-1">
              <AlertCircle size={11} /> Microphone access denied
            </p>
          )}
          {state === "idle" && (
            <p className="text-[#555] text-xs mt-2 text-center">Record audio to attach to your emergency alert</p>
          )}
        </>
      )}

      {state === "recording" && (
        <button
          onClick={stopRecording}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors text-sm border border-white/10"
        >
          <Square size={16} />
          Stop Recording ({formatTime(duration)})
        </button>
      )}

      {state === "processing" && (
        <div className="w-full py-3 rounded-xl bg-white/5 text-[#888] text-sm text-center">Processing…</div>
      )}

      {state === "done" && (
        <div className="space-y-2">
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
          )}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 text-center">
            ✅ Audio clip ready — will be attached to your next alert
          </div>
          <button onClick={reset} className="w-full py-2 rounded-xl bg-white/5 text-[#666] text-xs hover:bg-white/10 transition-colors">
            Record new clip
          </button>
        </div>
      )}
    </div>
  );
}
