import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to settings after 5 seconds
    const t = setTimeout(() => navigate('/Settings'), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-emerald-400" />
        </motion.div>

        <h1 className="text-3xl font-black text-white mb-3">Payment Successful!</h1>
        <p className="text-[#888] text-sm mb-2">Your subscription has been activated.</p>
        <p className="text-[#555] text-xs mb-8">Redirecting to Settings in 5 seconds…</p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/Settings"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            Go to Settings
          </Link>
          <Link
            to="/"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            Home
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-[#444] text-xs">
          <Shield size={12} />
          <span>Secured by PayFast</span>
        </div>
      </motion.div>
    </div>
  );
}
