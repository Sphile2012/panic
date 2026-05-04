import { WifiOff, Wifi, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner({ isOnline, queuedAlerts }) {
  const hasQueue = queuedAlerts?.length > 0;

  return (
    <AnimatePresence>
      {(!isOnline || hasQueue) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2 text-sm
            ${!isOnline
              ? "bg-amber-500/15 border border-amber-500/30"
              : "bg-blue-500/15 border border-blue-500/30"}`}
        >
          {!isOnline ? (
            <>
              <WifiOff size={14} className="text-amber-400 flex-shrink-0" />
              <span className="text-amber-300 text-xs font-medium">
                Offline — SOS will open WhatsApp directly & queue for retry when back online
              </span>
            </>
          ) : (
            <>
              <Clock size={14} className="text-blue-400 flex-shrink-0" />
              <span className="text-blue-300 text-xs font-medium">
                Back online — sending {queuedAlerts.length} queued alert{queuedAlerts.length > 1 ? "s" : ""}…
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}