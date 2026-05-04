import { useState, useEffect, useCallback } from "react";
import { functions } from "@/api/client";
import { MapPin, Smartphone, Search, ArrowLeft, Clock, Wifi, WifiOff, RefreshCw, Mail, Hash, Phone, BatteryLow, BatteryCharging, Battery, BatteryFull, BatteryMedium, BatteryWarning } from "lucide-react";

function BatteryIndicator({ level, charging }) {
  if (level == null) return null;
  const pct = Math.round(level);
  const color = charging ? '#4ade80' : pct <= 15 ? '#ef4444' : pct <= 30 ? '#facc15' : '#4ade80';
  const Icon = charging ? BatteryCharging : pct <= 15 ? BatteryLow : pct <= 50 ? BatteryMedium : BatteryFull;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Icon size={13} style={{ color }} />
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden" style={{ maxWidth: 60 }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{pct}%{charging ? ' ⚡' : ''}</span>
    </div>
  );
}

export default function FindMyPhone() {
  const [mode, setMode] = useState("login");
  const [imei, setImei] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!imei.trim() && !email.trim() && !phone.trim()) {
      setError("Please enter at least one: Device ID, email, or phone number.");
      setLoading(false);
      return;
    }

    const response = await functions.invoke("findMyPhoneLogin", {
      imei: imei.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setLoading(false);

    if (response.success) {
      setDevices(response.devices);
      setSearchParams({ imei: imei.trim() || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined });
      setLastRefreshed(new Date());
      setMode("tracking");
    } else {
      setError(response.error || "No device found. Please verify your details.");
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const response = await functions.invoke("findMyPhoneLogin", searchParams);
    if (response.success) {
      setDevices(response.devices);
      setLastRefreshed(new Date());
    }
    setRefreshing(false);
  }, [searchParams]);

  // Auto-refresh every 30s while on tracking screen
  useEffect(() => {
    if (mode !== "tracking") return;
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [mode, handleRefresh]);

  const openMap = (device) => {
    window.open(
      `https://www.google.com/maps?q=${device.last_latitude},${device.last_longitude}`,
      "_blank"
    );
  };

  const formatTime = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const getDeviceLabel = (device) => {
    const name = device.device_name || "Unknown Device";
    // Don't show raw UA strings
    if (name.includes("Windows NT") || name.includes("AppleWebKit")) {
      return device.platform === "ios" ? "iPhone / iPad" : "Android Phone";
    }
    return name;
  };

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
              <Smartphone size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Find My Device</h1>
            <p className="text-[#666] text-sm">Enter any one field to locate your device</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <Field
              label="Device ID / IMEI"
              value={imei}
              onChange={setImei}
              placeholder="e.g. PR-XXXXX-XXXXX-XXXXX"
              type="text"
              mono
            />
            <div className="flex items-center gap-3 text-[#333] text-xs uppercase tracking-widest">
              <div className="flex-1 h-px bg-white/5" />OR<div className="flex-1 h-px bg-white/5" />
            </div>
            <Field
              label="Email Address"
              value={email}
              onChange={setEmail}
              placeholder="registered@email.com"
              type="email"
            />
            <div className="flex items-center gap-3 text-[#333] text-xs uppercase tracking-widest">
              <div className="flex-1 h-px bg-white/5" />OR<div className="flex-1 h-px bg-white/5" />
            </div>
            <Field
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              placeholder="e.g. 0821234567"
              type="tel"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <Search size={16} />
              {loading ? "Searching..." : "Find My Device"}
            </button>
          </form>

          <p className="text-center text-[#444] text-xs mt-6">
            Your device must be registered with Panic Ring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setMode("login"); setDevices([]); setError(""); setSearchParams({}); }}
            className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Tracking Results</h1>
            <p className="text-[#555] text-xs">{devices.length} device{devices.length !== 1 ? "s" : ""} found
              {lastRefreshed && <> · Updated {lastRefreshed.toLocaleTimeString("en-ZA")}</>}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-teal-400" : "text-[#666]"} />
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-16">
            <Smartphone size={48} className="mx-auto text-[#333] mb-4" />
            <p className="text-[#666]">No devices found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device, i) => {
              const hasLocation = device.last_latitude != null && device.last_longitude != null;
              const timeAgo = formatTime(device.last_location_update);
              const label = getDeviceLabel(device);

              return (
                <div key={device.id || i} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasLocation ? "bg-green-500/15 text-green-400" : "bg-white/5 text-[#555]"}`}>
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{label}</p>
                        <p className="text-[#555] text-xs capitalize mt-0.5">
                          {device.platform?.replace("_", " ")} • {device.device_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {device.is_lost && (
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">Lost</span>
                      )}
                      <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1">
                         {hasLocation
                           ? <Wifi size={12} className="text-green-400" />
                           : <WifiOff size={12} className="text-[#555]" />}
                         <span className={`text-xs ${hasLocation ? "text-green-400" : "text-[#555]"}`}>
                           {hasLocation ? "Tracking" : "Offline"}
                         </span>
                       </div>
                       <BatteryIndicator level={device.battery_level} charging={device.battery_charging} />
                      </div>
                      </div>
                      </div>

                      {/* Low battery warning */}
                      {device.battery_level != null && device.battery_level <= 15 && !device.battery_charging && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">
                      <BatteryLow size={14} className="text-red-400 shrink-0" />
                      <p className="text-red-400 text-xs font-medium">
                       Battery critical at {Math.round(device.battery_level)}% — tracker may go offline soon. An alert has been sent.
                      </p>
                      </div>
                      )}

                  {/* Device identity details */}
                  <div className="space-y-1.5 mb-3">
                    {device.owner_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={11} className="text-[#555] shrink-0" />
                        <span className="text-[#666] text-xs truncate">{device.owner_email}</span>
                      </div>
                    )}
                    {device.device_id && (
                      <div className="flex items-center gap-2">
                        <Hash size={11} className="text-[#555] shrink-0" />
                        <span className="text-[#444] text-[11px] font-mono truncate">{device.device_id}</span>
                      </div>
                    )}
                    {device.owner_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={11} className="text-[#555] shrink-0" />
                        <span className="text-[#666] text-xs">{device.owner_phone}</span>
                      </div>
                    )}
                  </div>

                  {hasLocation ? (
                    <div className="space-y-3">
                      {/* Static map thumbnail */}
                      <div
                        className="w-full rounded-xl overflow-hidden border border-white/[0.07] cursor-pointer relative"
                        style={{ height: 140 }}
                        onClick={() => openMap(device)}
                      >
                        <img
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${device.last_latitude},${device.last_longitude}&zoom=15&size=400x140&scale=2&markers=color:red%7C${device.last_latitude},${device.last_longitude}&style=feature:all%7Celement:geometry%7Ccolor:0x1a1a2e&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x888888`}
                          alt="map"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback to OpenStreetMap tile if no API key
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className="absolute inset-0 bg-[#111] items-center justify-center flex-col gap-2"
                        >
                          <MapPin size={24} className="text-red-400" />
                          <span className="text-[#666] text-xs font-mono">
                            {device.last_latitude.toFixed(5)}, {device.last_longitude.toFixed(5)}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-2 py-1 text-[10px] text-white flex items-center gap-1">
                          <MapPin size={9} /> Tap to open
                        </div>
                      </div>

                      <div className="bg-white/[0.03] rounded-xl p-3 flex items-start gap-2">
                        <MapPin size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {device.last_address && (
                            <p className="text-white text-xs font-medium mb-0.5">{device.last_address}</p>
                          )}
                          <p className="text-[#666] text-[10px] font-mono">
                            {device.last_latitude.toFixed(6)}, {device.last_longitude.toFixed(6)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {device.last_accuracy && (
                              <span className="text-[10px]" style={{color: device.last_accuracy < 20 ? '#4ade80' : device.last_accuracy < 50 ? '#facc15' : '#f87171'}}>
                                ±{Math.round(device.last_accuracy)}m accuracy
                              </span>
                            )}
                            {timeAgo && (
                              <span className="flex items-center gap-1 text-[#555] text-[10px]">
                                <Clock size={9} /> {timeAgo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openMap(device)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <MapPin size={14} /> Open in Google Maps
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-amber-400 text-xs font-medium mb-1">📍 Location Not Available</p>
                      <p className="text-[#666] text-xs leading-relaxed">
                        This device is registered but hasn't shared its location. Ask the owner to open Panic Ring and enable location sharing.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type, mono }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 focus-within:border-red-500/40 transition-colors">
      <label className="text-[10px] uppercase tracking-widest text-[#555] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-white placeholder-[#333] focus:outline-none text-sm ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}