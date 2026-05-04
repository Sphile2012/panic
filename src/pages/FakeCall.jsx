import { useState, useEffect } from "react";
import { Phone, X, Volume2, VolumeX, User } from "lucide-react";
import { motion } from "framer-motion";

export default function FakeCall() {
  const [answered, setAnswered] = useState(false);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (answered) {
      const timer = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [answered]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1a1a2e] to-[#0a0a14] text-white flex flex-col items-center justify-center p-6">
      {!answered ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-28 h-28 bg-gradient-to-br from-blue-900/50 to-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-500/30"
          >
            <User size={48} className="text-blue-300" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2">Mom</h1>
          <p className="text-[#888] mb-1">Mobile</p>
          <p className="text-[#666] text-sm mb-8">Incoming call...</p>

          <div className="flex gap-6 justify-center">
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={28} />
            </button>
            <button
              onClick={() => setAnswered(true)}
              className="w-16 h-16 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors"
            >
              <Phone size={28} />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center w-full max-w-sm"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-green-900/50 to-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
            <User size={48} className="text-green-300" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Mom</h1>
          <p className="text-green-400 text-lg font-mono mb-8">{formatTime(duration)}</p>

          <div className="flex gap-6 justify-center mb-8">
            <button
              onClick={() => setMuted(!muted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                muted ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>

          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center mx-auto transition-colors"
          >
            <Phone size={28} className="transform rotate-135" />
          </button>
        </motion.div>
      )}
    </div>
  );
}