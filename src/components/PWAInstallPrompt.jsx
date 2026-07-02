/**
 * REQ 17 — PWA Install Prompt
 * Shows on first visit if browser supports installation.
 * Light theme to match the app's current design.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS (no beforeinstallprompt — must show manual guide)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !window.navigator.standalone;
    setIsIOS(ios);

    if (ios) {
      const dismissed = localStorage.getItem("pr_pwa_dismissed");
      if (!dismissed) {
        // Show iOS guide after 3 seconds
        const t = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(t);
      }
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pr_pwa_dismissed");
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("pr_pwa_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-prompt"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed z-50 left-0 right-0 px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)", maxWidth: 480, margin: "0 auto" }}
        >
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#FDE8E8" }}>
              <Smartphone size={20} color="#C41A1A" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: "#1E2A2C" }}>Install Panic Ring</p>
              {isIOS ? (
                <p style={{ color: "#64748B", fontSize: 11, lineHeight: 1.4 }}>
                  Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> in Safari
                </p>
              ) : (
                <p style={{ color: "#64748B", fontSize: 11 }}>Add to home screen for instant SOS access</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 rounded-xl font-bold text-white text-xs"
                  style={{ background: "#C41A1A" }}
                >
                  Install
                </button>
              )}
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#F1F3F7" }}
              >
                <X size={14} color="#64748B" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
