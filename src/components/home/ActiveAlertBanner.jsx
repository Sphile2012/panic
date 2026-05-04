import { motion } from "framer-motion";
import { Phone, CheckCircle } from "lucide-react";

export default function ActiveAlertBanner({ alert, onResolve }) {
  return (
    <motion.div
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="bg-red-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-3 h-3 bg-white rounded-full"
        />
        <div>
          <p className="font-bold text-sm">🚨 ALERT ACTIVE</p>
          <p className="text-red-100 text-xs">Contacts notified · GPS shared</p>
        </div>
      </div>
      <button
        onClick={onResolve}
        className="flex items-center gap-1.5 bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-full"
      >
        <CheckCircle size={12} /> Resolve
      </button>
    </motion.div>
  );
}