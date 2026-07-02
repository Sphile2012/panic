import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { entities, functions } from "@/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Plus, Zap, Users, HeartPulse, ChevronLeft, ChevronRight } from "lucide-react";
import LandingHero from "@/components/home/LandingHero";
import OnboardingSetup from "@/components/home/OnboardingSetup";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import EmergencyCallingScreen from "@/components/home/EmergencyCallingScreen";
import TapToAlert from "@/components/home/TapToAlert";
import useBatteryMonitor from "@/hooks/useBatteryMonitor";

function useSafetyStats(contacts, alerts, location) {
  const resolved = alerts.filter(a => a.status === "resolved").length;
  const safetyPct = Math.min(100, Math.round(30 + contacts.length * 10 + resolved * 5 + (location ? 15 : 0)));
  return [
    { pct: safetyPct, label: "Your safety", sub: contacts.length > 0 ? `${contacts.length} contacts ready` : "Add contacts to improve" },
    { pct: Math.min(100, contacts.length * 20), label: "Contact coverage", sub: `${contacts.length} of 5 recommended` },
    { pct: location ? 90 : 20, label: "Location status", sub: location ? "GPS active & accurate" : "Enable location for full safety" },
  ];
}

// ── Metallic PANIC button — brushed steel ring + glossy red dome ──────
function PanicButtonSVG({ onTrigger, isActive, pressing }) {
  const sz = "min(280px, 78vw)";
  return (
    <div
      className="relative flex items-center justify-center mx-auto select-none"
      style={{ width: sz, height: sz }}
    >
      <svg viewBox="0 0 280 280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Brushed steel outer ring */}
          <radialGradient id="steelOuter" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="30%" stopColor="#B0B0B0" />
            <stop offset="60%" stopColor="#888" />
            <stop offset="85%" stopColor="#666" />
            <stop offset="100%" stopColor="#555" />
          </radialGradient>
          <radialGradient id="steelInner" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#D0D0D0" />
            <stop offset="40%" stopColor="#909090" />
            <stop offset="80%" stopColor="#606060" />
            <stop offset="100%" stopColor="#404040" />
          </radialGradient>
          {/* Glossy red dome */}
          <radialGradient id="redDome" cx="38%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#FF8080" />
            <stop offset="25%" stopColor="#E02020" />
            <stop offset="60%" stopColor="#A00000" />
            <stop offset="85%" stopColor="#700000" />
            <stop offset="100%" stopColor="#500000" />
          </radialGradient>
          {/* Dome highlight */}
          <radialGradient id="domeHighlight" cx="35%" cy="25%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          {/* Active pressed state */}
          <radialGradient id="redDomePressed" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#CC4040" />
            <stop offset="40%" stopColor="#880000" />
            <stop offset="100%" stopColor="#400000" />
          </radialGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5" /></filter>
          <filter id="innerShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.6" /></filter>
        </defs>

        {/* Outer steel ring */}
        <circle cx="140" cy="140" r="136" fill="url(#steelOuter)" filter="url(#shadow)" />

        {/* Ring groove */}
        <circle cx="140" cy="140" r="104" fill="none" stroke="#333" strokeWidth="6" />
        <circle cx="140" cy="140" r="104" fill="url(#steelInner)" />

        {/* Screws at 4 corners */}
        {[[140,14],[266,140],[140,266],[14,140]].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="9" fill="url(#steelOuter)" stroke="#444" strokeWidth="1" />
            <line x1={cx-5} y1={cy} x2={cx+5} y2={cy} stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={cx} y1={cy-5} x2={cx} y2={cy+5} stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}

        {/* Red dome button */}
        <circle cx="140" cy="136" r="88"
          fill={pressing ? "url(#redDomePressed)" : "url(#redDome)"}
          filter="url(#innerShadow)"
          style={{ transition: "filter 0.1s" }}
        />
        {/* Dome highlight */}
        <ellipse cx="118" cy="102" rx="38" ry="24" fill="url(#domeHighlight)" />

        {/* Exclamation mark */}
        <text x="140" y="148" textAnchor="middle" fill="rgba(80,0,0,0.7)"
          fontSize="52" fontWeight="900" fontFamily="Arial Black, sans-serif">!</text>

        {/* "PANIC" text around ring — top */}
        <path id="topArc" d="M 30,140 A 110,110 0 0,1 250,140" fill="none" />
        <text fontSize="15" fontWeight="900" fontFamily="Arial Black, sans-serif"
          fill="#C8C8C8" letterSpacing="6">
          <textPath href="#topArc" startOffset="20%">PANIC</textPath>
        </text>

        {/* "PANIC" text around ring — left */}
        <path id="leftArc" d="M 140,30 A 110,110 0 0,0 140,250" fill="none" />
        <text fontSize="13" fontWeight="900" fontFamily="Arial Black, sans-serif"
          fill="#A0A0A0" letterSpacing="5">
          <textPath href="#leftArc" startOffset="15%">PANIC</textPath>
        </text>

        {/* "PANIC" text around ring — right */}
        <path id="rightArc" d="M 140,250 A 110,110 0 0,0 140,30" fill="none" />
        <text fontSize="13" fontWeight="900" fontFamily="Arial Black, sans-serif"
          fill="#A0A0A0" letterSpacing="5">
          <textPath href="#rightArc" startOffset="15%">PANIC</textPath>
        </text>

        {/* Active pulse ring */}
        {isActive && (
          <circle cx="140" cy="140" r="95" fill="none" stroke="#FF4444" strokeWidth="3" opacity="0.8">
            <animate attributeName="r" values="95;130;95" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Invisible tap target */}
      <button
        className="absolute rounded-full focus:outline-none"
        style={{ width: "63%", height: "63%", background: "transparent", zIndex: 10 }}
        onMouseDown={onTrigger}
        onTouchStart={onTrigger}
        aria-label="Panic button — hold to trigger SOS"
      />
    </div>
  );
}

// ── Teal location pin component ────────────────────────────────────────
function LocationPin({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ minWidth: 60 }}>
      <span style={{ fontSize: 10, color: "#5A6A6E", fontWeight: 600, textAlign: "center" }}>{label}</span>
      <div className="relative flex items-center justify-center" style={{ width: 40, height: 52 }}>
        <svg viewBox="0 0 40 52" width="40" height="52" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <radialGradient id={`pinGrad_${label}`} cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#4CC8D0" />
              <stop offset="100%" stopColor="#1A8A90" />
            </radialGradient>
          </defs>
          <path d="M20 2C10.6 2 3 9.6 3 19c0 10.5 14 28 16.3 30.6.4.5 1 .5 1.4 0C22.8 47 37 29.5 37 19 37 9.6 29.4 2 20 2z"
            fill={`url(#pinGrad_${label})`} />
          <circle cx="20" cy="19" r="11" fill="rgba(255,255,255,0.2)" />
        </svg>
        <div style={{ position: "relative", zIndex: 1, marginTop: -6 }}>
          <Icon size={15} color="#fff" strokeWidth={2.5} />
        </div>
      </div>
      <span style={{ fontSize: 11, color: "#2A3A3E", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [statIdx, setStatIdx] = useState(0);
  const [showCallingScreen, setShowCallingScreen] = useState(false);
  const [location, setLocation] = useState(null);
  const [pressing, setPressing] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const pressTimer = useRef(null);
  const holdInterval = useRef(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['safetyProfile', user?.email],
    queryFn: () => entities.SafetyProfile.filter({ owner_email: user.email }).then(d => d[0] || null),
    enabled: !!user?.email,
    staleTime: 60000,
  });
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', user?.email],
    queryFn: () => entities.Alert.filter({ owner_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
    staleTime: 20000,
    refetchInterval: 30000,
  });
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', user?.email],
    queryFn: () => entities.EmergencyContact.filter({ owner_email: user.email }, 'priority', 20),
    enabled: !!user?.email,
    staleTime: 120000,
  });

  const loading = profileLoading || alertsLoading || contactsLoading;
  const activeAlert = alerts.find(a => a.status === 'active') || null;
  const needsOnboarding = !loading && isAuthenticated && !profile;
  const stats = useSafetyStats(contacts, alerts, location);

  useBatteryMonitor(user, contacts);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] });
    queryClient.invalidateQueries({ queryKey: ['safetyProfile', user?.email] });
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const w = navigator.geolocation.watchPosition(
      p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(w);
  }, []);

  useEffect(() => {
    if (!activeAlert) return;
    const id = navigator.geolocation.watchPosition(
      pos => entities.Alert.update(activeAlert.id, {
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
      }), null, { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [activeAlert?.id]);

  const handleAlertResolved = async (alertId) => {
    await entities.Alert.update(alertId, { status: 'resolved', resolved_at: new Date().toISOString() });
    setShowCallingScreen(false);
    invalidateAll();
  };

  const handleAlertTriggered = () => {
    setShowCallingScreen(true);
    invalidateAll();
  };

  // Hold 2s to trigger SOS
  const startHold = () => {
    setPressing(true);
    setHoldPct(0);
    const start = Date.now();
    holdInterval.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 2000) * 100);
      setHoldPct(pct);
      if (pct >= 100) {
        clearInterval(holdInterval.current);
        setPressing(false);
        setHoldPct(0);
        handleAlertTriggered();
      }
    }, 30);
  };

  const cancelHold = () => {
    clearInterval(holdInterval.current);
    setPressing(false);
    setHoldPct(0);
  };

  if (isLoadingAuth || (isAuthenticated && loading)) return <HomeSkeleton />;
  if (!isAuthenticated) return <LandingHero onGetStarted={() => navigate('/Login')} />;
  if (!loading && needsOnboarding) return <OnboardingSetup user={user} onComplete={invalidateAll} />;

  const cur = stats[statIdx];

  const nearbyItems = [
    { label: "Emergency", icon: Plus,       value: location ? "509 m" : "—" },
    { label: "Defibrillator", icon: Zap,    value: location ? "229 m" : "—" },
    { label: "Rescuers",  icon: Users,      value: String(contacts.length) },
    { label: "Users",     icon: HeartPulse, value: "0" },
  ];

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #CBD9DB 0%, #D6EAEC 30%, #B8DEE3 100%)",
        overflowX: "hidden",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Overlays */}
      <AnimatePresence>
        {showCallingScreen && activeAlert && (
          <EmergencyCallingScreen
            contacts={contacts} alert={activeAlert}
            user={user} onDismiss={() => setShowCallingScreen(false)}
          />
        )}
      </AnimatePresence>
      <TapToAlert corner="bottom-right" onTriggered={handleAlertTriggered} />

      {/* Active alert strip */}
      {activeAlert && (
        <motion.div
          initial={{ y: -56 }} animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
          style={{ background: "#C41A1A", maxWidth: 480, margin: "0 auto" }}
        >
          <div className="flex items-center gap-2">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-white font-black text-sm">🚨 EMERGENCY ACTIVE</span>
          </div>
          <button onClick={() => handleAlertResolved(activeAlert.id)}
            className="bg-white text-red-700 text-xs font-black px-3 py-1.5 rounded-full">
            Resolve
          </button>
        </motion.div>
      )}

      {/* ── TOP BAR ── */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.7)",
          marginTop: activeAlert ? 44 : 0,
        }}
      >
        <div className="flex items-center gap-0.5">
          <span style={{ color: "#C41A1A", fontWeight: 900, fontSize: 20 }}>i</span>
          <span style={{ color: "#2A2A2A", fontWeight: 900, fontSize: 18 }}>
            {user?.full_name?.split(" ")[0] ? `HELLO, ${user.full_name.split(" ")[0].toUpperCase()}` : "PANIC RING"}
          </span>
        </div>
        <Link to="/Settings" aria-label="Settings">
          <Settings size={22} color="#2A2A2A" />
        </Link>
      </header>

      {/* ── NEARBY ITEMS ROW ── */}
      <div
        className="flex items-start justify-around px-2 py-3 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {nearbyItems.map(item => (
          <LocationPin key={item.label} icon={item.icon} label={item.label} value={item.value} />
        ))}
      </div>

      {/* ── SAFETY % (swipeable) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative">
        <button
          onClick={() => setStatIdx(i => (i - 1 + stats.length) % stats.length)}
          className="absolute flex items-center justify-center rounded-full"
          style={{ left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.4)" }}
          aria-label="Previous"
        >
          <ChevronLeft size={20} color="#2A8A90" />
        </button>

        <button
          onClick={() => setStatIdx(i => (i + 1) % stats.length)}
          className="absolute flex items-center justify-center rounded-full"
          style={{ right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, background: "rgba(255,255,255,0.4)" }}
          aria-label="Next"
        >
          <ChevronRight size={20} color="#2A8A90" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={statIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            className="text-center px-12"
          >
            <p style={{ fontSize: "clamp(56px, 18vw, 88px)", fontWeight: 900, color: "#3AABB8", lineHeight: 1, marginBottom: 4 }}>
              {cur.pct}%
            </p>
            <p style={{ fontSize: "clamp(20px, 6vw, 30px)", fontWeight: 600, color: "#3AABB8", marginBottom: 6 }}>
              {cur.label}
            </p>
            <p style={{ fontSize: 13, color: "#5A8A8E" }}>{cur.sub}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {stats.map((_, i) => (
                <button key={i} onClick={() => setStatIdx(i)}
                  style={{
                    width: i === statIdx ? 20 : 8, height: 8, borderRadius: 4,
                    background: i === statIdx ? "#3AABB8" : "rgba(58,171,184,0.3)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── PANIC BUTTON + BOTTOM CIRCLES ── */}
      <div className="flex-shrink-0 relative" style={{ paddingBottom: 72 }}>
        {/* White curved wave behind circles */}
        <svg viewBox="0 0 480 200" preserveAspectRatio="none"
          style={{ width: "100%", height: 200, position: "absolute", top: 0, left: 0, zIndex: 0 }}>
          <path d="M0,90 Q120,30 240,70 Q360,110 480,50 L480,200 L0,200 Z"
            fill="rgba(255,255,255,0.5)" />
          <path d="M0,110 Q120,55 240,88 Q360,120 480,68 L480,200 L0,200 Z"
            fill="rgba(255,255,255,0.75)" />
        </svg>

        {/* PANIC BUTTON — centred, metallic */}
        <div className="relative flex flex-col items-center" style={{ zIndex: 2, paddingTop: 20 }}>
          <p style={{ fontSize: 11, color: "#8A6060", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
            {pressing ? `HOLD… ${Math.round(holdPct)}%` : activeAlert ? "ALERT ACTIVE — TAP TO VIEW" : "HOLD 2s TO TRIGGER SOS"}
          </p>

          <PanicButtonSVG
            onTrigger={startHold}
            isActive={!!activeAlert}
            pressing={pressing}
          />

          {/* Hold progress bar */}
          {pressing && (
            <div style={{ width: "60%", height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", background: "#C41A1A", borderRadius: 2, width: `${holdPct}%` }}
              />
            </div>
          )}

          {/* Cancel hold */}
          {pressing && (
            <button onMouseUp={cancelHold} onTouchEnd={cancelHold}
              className="mt-2 text-xs font-semibold"
              style={{ color: "#888" }}>
              Release to cancel
            </button>
          )}
        </div>

        {/* Bottom red helper circles */}
        <div className="relative flex items-end justify-center" style={{ zIndex: 3, height: 10, marginTop: -10 }}>
          {/* HELP OTHERS */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => navigate('/Contacts')}
            className="absolute flex flex-col items-center justify-center rounded-full"
            style={{
              width: "clamp(90px, 28vw, 110px)", height: "clamp(90px, 28vw, 110px)",
              bottom: 16,
              left: "calc(50% - clamp(115px, 34vw, 135px))",
              background: "radial-gradient(circle at 40% 35%, #EF5050, #B01818)",
              boxShadow: "4px 6px 18px rgba(176,24,24,0.55), inset -3px -3px 8px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,160,160,0.2)",
            }}
          >
            <span className="text-white font-black text-xs text-center leading-tight" style={{ fontSize: "clamp(9px,2.5vw,11px)" }}>
              HELP{"\n"}OTHERS
            </span>
          </motion.button>

          {/* I NEED HELP */}
          <motion.button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            className="absolute flex flex-col items-center justify-center rounded-full"
            style={{
              width: "clamp(120px, 38vw, 148px)", height: "clamp(120px, 38vw, 148px)",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              background: pressing
                ? "radial-gradient(circle at 42% 38%, #CC3030, #8A0000)"
                : "radial-gradient(circle at 40% 35%, #E83535, #A91515)",
              boxShadow: pressing
                ? "0 4px 24px rgba(140,0,0,0.7), inset -3px -4px 10px rgba(0,0,0,0.3)"
                : "6px 8px 24px rgba(168,21,21,0.6), inset -4px -5px 12px rgba(0,0,0,0.25), inset 2px 2px 7px rgba(255,150,150,0.2)",
              zIndex: 10,
            }}
            animate={activeAlert ? { scale: [1, 1.04, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.3 }}
          >
            {pressing && (
              <motion.div className="absolute inset-0 rounded-full border-4 border-white/40"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 0.7 }} />
            )}
            <span className="text-white font-black text-center leading-tight" style={{ fontSize: "clamp(11px,3.5vw,14px)" }}>
              {pressing ? "SENDING…" : "I NEED\nHELP"}
            </span>
          </motion.button>

          {/* Small expand circle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/AlertHistory')}
            className="absolute flex items-center justify-center rounded-full"
            style={{
              width: "clamp(56px, 17vw, 68px)", height: "clamp(56px, 17vw, 68px)",
              bottom: 44,
              right: "calc(50% - clamp(115px, 34vw, 135px))",
              background: "radial-gradient(circle at 40% 35%, #E0E0E0, #B0B0B0)",
              boxShadow: "3px 4px 10px rgba(0,0,0,0.22), inset -2px -2px 5px rgba(0,0,0,0.12), inset 1px 1px 3px rgba(255,255,255,0.5)",
            }}
          >
            <span style={{ fontSize: 18, color: "#777" }}>↗</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
