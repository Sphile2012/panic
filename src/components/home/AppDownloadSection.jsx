import { useState } from "react";
import { Smartphone, Download, Check, Shield, X, Share, Plus, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const mobileFeatures = [
  "Emergency SOS with one tap",
  "Live GPS & location sharing",
  "Emergency contacts management",
  "Alert history and reports",
];

const quickLinks = [
  { label: "Home",               to: "/" },
  { label: "Emergency Contacts", to: "/Contacts" },
  { label: "Live Map",           to: "/Map" },
  { label: "User Guide",         to: "/Guide" },
  { label: "FAQ",                to: "/faq" },
];

const supportLinks = [
  { label: "FAQ",                      href: "/faq" },
  { label: "Complaints & Suggestions", href: "/complaints" },
  { label: "WhatsApp Support",         href: "https://wa.me/27000000000" },
  { label: "Email Support",            href: "mailto:poomeigh503@gmail.com" },
];

function IOSGuide({ onClose }) {
  const steps = [
    { icon: Share,       text: 'Tap the Share button at the bottom of Safari' },
    { icon: Plus,        text: 'Scroll down and tap "Add to Home Screen"' },
    { icon: Smartphone,  text: 'Tap "Add" in the top right corner' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: "#fff" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg" style={{ color: "#1E2A2C" }}>Add to Home Screen</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F1F3F7" }}>
            <X size={16} color="#666" />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: "#5A6A70" }}>
          Install Panic Ring on your iPhone — no App Store needed:
        </p>
        <div className="space-y-4">
          {steps.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FDE8E8" }}>
                <Icon size={16} color="#C41A1A" />
              </div>
              <div className="flex-1 pt-1">
                <span className="text-xs font-bold mr-2" style={{ color: "#C41A1A" }}>Step {i + 1}</span>
                <span className="text-sm" style={{ color: "#1E2A2C" }}>{text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 p-3 rounded-2xl" style={{ background: "#E8F6F8" }}>
          <p className="text-xs" style={{ color: "#2A7A80" }}>
            ✓ Works like a native app — offline support, full screen, no browser UI
          </p>
        </div>
        <button onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: "#C41A1A" }}>
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

function AndroidGuide({ onClose }) {
  const steps = [
    { icon: MoreVertical, text: 'Tap the 3-dot menu in Chrome (top right)' },
    { icon: Plus,         text: 'Tap "Add to Home screen"' },
    { icon: Smartphone,   text: 'Confirm by tapping "Add"' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: "#fff" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg" style={{ color: "#1E2A2C" }}>Add to Home Screen</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F1F3F7" }}>
            <X size={16} color="#666" />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: "#5A6A70" }}>
          Install Panic Ring on Android — no Play Store needed:
        </p>
        <div className="space-y-4">
          {steps.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#E8F6F8" }}>
                <Icon size={16} color="#189098" />
              </div>
              <div className="flex-1 pt-1">
                <span className="text-xs font-bold mr-2" style={{ color: "#189098" }}>Step {i + 1}</span>
                <span className="text-sm" style={{ color: "#1E2A2C" }}>{text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 p-3 rounded-2xl" style={{ background: "#E8F6F8" }}>
          <p className="text-xs" style={{ color: "#2A7A80" }}>
            ✓ Works offline, opens in full screen, auto-updates
          </p>
        </div>
        <button onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: "#189098" }}>
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AppDownloadSection() {
  const [showIOS, setShowIOS] = useState(false);
  const [showAndroid, setShowAndroid] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showIOS && <IOSGuide onClose={() => setShowIOS(false)} />}
        {showAndroid && <AndroidGuide onClose={() => setShowAndroid(false)} />}
      </AnimatePresence>

      {/* ── INSTALL SECTION ─────────────────────────────────────── */}
      <section className="py-12 px-4" style={{ background: "#0a0a0f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-lg mx-auto">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Download size={12} color="#F87171" />
              <span style={{ color: "#F87171", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>INSTALL THE APP</span>
            </div>
            <h2 className="font-black text-white mb-2" style={{ fontSize: "clamp(22px,6vw,32px)" }}>
              Add to Your Home Screen
            </h2>
            <p style={{ color: "#8A9AB0", fontSize: 14, lineHeight: 1.6 }}>
              Install Panic Ring as a PWA — works on any device,
              no app store required. Full offline support included.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {mobileFeatures.map(f => (
              <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Check size={11} color="#4ADE80" />
                <span style={{ color: "#94A3B8", fontSize: 12 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Install buttons — stacked on mobile, side by side on wider */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>

            {/* iOS */}
            <button
              onClick={() => setShowIOS(true)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 text-left w-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <span style={{ fontSize: 22 }}>🍎</span>
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontSize: 14 }}>iPhone / iPad</p>
                <p style={{ color: "#64748B", fontSize: 12 }}>iOS Safari — tap Share → Add</p>
                <p style={{ color: "#EF4444", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                  View steps →
                </p>
              </div>
            </button>

            {/* Android */}
            <button
              onClick={() => setShowAndroid(true)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 text-left w-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(24,144,152,0.15)", border: "1px solid rgba(24,144,152,0.25)" }}>
                <span style={{ fontSize: 22 }}>🤖</span>
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontSize: 14 }}>Android</p>
                <p style={{ color: "#64748B", fontSize: 12 }}>Chrome — menu → Add to Home</p>
                <p style={{ color: "#2DD4BF", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                  View steps →
                </p>
              </div>
            </button>

          </div>

          {/* APK direct download */}
          <div className="mt-4 p-4 rounded-2xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-white" style={{ fontSize: 13 }}>Android APK (Direct)</p>
                <p style={{ color: "#64748B", fontSize: 11 }}>Version 2.1.0 · 25 MB · No Play Store needed</p>
              </div>
              <a
                href="/PanicRing-v2.1.0.apk"
                download
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0"
                style={{ background: "#16A34A", boxShadow: "0 2px 8px rgba(22,163,74,0.35)" }}
              >
                <Download size={14} />
                Download APK
              </a>
            </div>
          </div>

          {/* PWA info note */}
          <p className="text-center mt-5" style={{ color: "#475569", fontSize: 11 }}>
            💡 After installing, the app opens in full screen — just like a native app. Auto-updates in the background.
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ background: "#0a0a0f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-lg mx-auto px-4 py-10">

          {/* Brand row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Shield size={14} color="#2DD4BF" />
            </div>
            <span className="text-white font-bold">PanicRing</span>
          </div>
          <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.65, marginBottom: 20 }}>
            Your personal safety companion. Advanced emergency response for everyone.
          </p>

          {/* Links grid — 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-3" style={{ fontSize: 13 }}>Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} style={{ color: "#64748B", fontSize: 13 }}
                      className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3" style={{ fontSize: 13 }}>Support</h4>
              <ul className="space-y-2">
                {supportLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} style={{ color: "#64748B", fontSize: 13 }}
                      className="hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2 mb-8">
            <a href="mailto:poomeigh503@gmail.com"
              className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              style={{ color: "#64748B" }}>
              <span>✉</span> poomeigh503@gmail.com
            </a>
            <a href="https://wa.me/27000000000"
              className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              style={{ color: "#64748B" }}>
              <span>💬</span> 24/7 WhatsApp Support
            </a>
            <span className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
              <span>📍</span> South Africa
            </span>
          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: "#334155", fontSize: 11 }}>© {new Date().getFullYear()} PanicRing. All rights reserved.</p>
            <div className="flex gap-3">
              <Link to="/privacy" style={{ color: "#475569", fontSize: 11 }} className="hover:text-white transition-colors underline">Privacy Policy</Link>
              <Link to="/terms" style={{ color: "#475569", fontSize: 11 }} className="hover:text-white transition-colors underline">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
