import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entities } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Bell, MapPin, Phone, Crown, LogOut,
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle,
  Wifi, WifiOff, Battery, Smartphone, RefreshCw,
  HelpCircle, Lock, Mic, Camera, Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SubscriptionPanel from "@/components/settings/SubscriptionPanel";
import DevicePanel from "@/components/settings/DevicePanel";
import DeviceInfoPanel from "@/components/settings/DeviceInfoPanel";
import PageHeader from "@/components/ui/PageHeader";

// ── Troubleshooting data ──────────────────────────────────────────────────────
const TROUBLESHOOTING = [
  {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "SOS button not working",
    steps: [
      "Hold the button for the full required duration (1.5–3 seconds depending on mode).",
      "Check your internet connection — SOS requires data to send alerts.",
      "Make sure you have at least one emergency contact added in the Contacts page.",
      "Grant location permission: Settings → Apps → Panic Ring → Permissions → Location → Allow all the time.",
      "Try signing out and back in, then test again.",
    ],
  },
  {
    icon: Navigation,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Location not accurate or unavailable",
    steps: [
      "Enable 'High Accuracy' mode: Device Settings → Location → Mode → High Accuracy.",
      "Make sure GPS is ON, not just Wi-Fi location.",
      "Go outside or near a window — GPS signals are weak indoors.",
      "Restart your device to refresh the GPS chip.",
      "Grant 'Allow all the time' location permission to Panic Ring.",
      "Check that Location Sharing is toggled ON in Safety Settings above.",
    ],
  },
  {
    icon: Wifi,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Contacts not receiving alerts",
    steps: [
      "Verify contact phone numbers include the country code (e.g. +27821234567).",
      "Check that email addresses are spelled correctly.",
      "Ask contacts to check their WhatsApp spam or email junk folder.",
      "Make sure 'Notify SMS' and 'Notify Email' are enabled for each contact.",
      "Test with a different contact to isolate the issue.",
      "Ensure your device has active mobile data or Wi-Fi when triggering SOS.",
    ],
  },
  {
    icon: Smartphone,
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    title: "Find My Device not showing location",
    steps: [
      "Open the app on the device you want to find — it must be online.",
      "Enable Location Sharing in Safety Settings on that device.",
      "The device must have been active recently for location to be current.",
      "Check that the device has mobile data or Wi-Fi enabled.",
      "Location updates every 5 minutes in the background — allow a few minutes.",
    ],
  },
  {
    icon: Battery,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    title: "App draining battery",
    steps: [
      "Disable background location if you don't need continuous tracking.",
      "Turn off Crime Alerts if not needed in your area.",
      "Enable Battery Saver mode on your device for non-emergency periods.",
      "Make sure the app is not excluded from battery optimisation — this can cause missed alerts.",
      "Update to the latest version of Panic Ring for battery improvements.",
    ],
  },
  {
    icon: Mic,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    title: "Audio recording not working",
    steps: [
      "Grant microphone permission: Device Settings → Apps → Panic Ring → Permissions → Microphone.",
      "Make sure no other app is using the microphone at the same time.",
      "Try closing and reopening the app.",
      "Check that your device microphone is not physically blocked or damaged.",
    ],
  },
  {
    icon: Lock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Can't log in or account issues",
    steps: [
      "Double-check your email address — it must match exactly what you registered with.",
      "Password is case-sensitive — check Caps Lock is off.",
      "Try registering a new account if you haven't registered yet.",
      "Clear your browser cache and cookies, then try again.",
      "Contact support at poomeigh503@gmail.com if you're locked out.",
    ],
  },
  {
    icon: Camera,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "Fall detection triggering incorrectly",
    steps: [
      "Lower the sensitivity to 'Low' in the Smartwatch → Fall Detection settings.",
      "Avoid placing your phone in a bag that gets dropped or shaken frequently.",
      "Fall detection uses your device's accelerometer — vigorous exercise may trigger it.",
      "Disable fall detection during sports or activities with sudden movements.",
      "When a false alarm triggers, tap 'I'm OK — Cancel' within 10 seconds.",
    ],
  },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openTrouble, setOpenTrouble] = useState(null);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['safetyProfile', user?.email],
    queryFn: () => entities.SafetyProfile.filter({ owner_email: user.email }),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const rawProfile = profileData?.[0];
  const profileId = rawProfile?.id;
  const defaultProfile = {
    custom_alert_message: 'I need help! Please contact me immediately.',
    auto_call_911: false, device_connected: false, device_name: '',
    subscription_plan: 'basic', location_sharing: true,
    safe_zones_alerts: true, crime_alerts: false, owner_phone: '',
  };

  const [localProfile, setLocalProfile] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const profile = localProfile ?? rawProfile ?? defaultProfile;

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async (updates) => {
      const merged = { ...profile, ...updates };
      setLocalProfile(merged);
      if (profileId) {
        await entities.SafetyProfile.update(profileId, updates);
      } else {
        await entities.SafetyProfile.create({ ...merged, owner_email: user.email });
      }
      return Object.keys(updates)[0];
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ['safetyProfile', user?.email] });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 1800);
    },
  });

  const toggle = (key) => save({ [key]: !profile[key] });

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="text-center">
          <Shield size={48} className="text-[#333] mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Sign in to access Settings</p>
          <button onClick={() => navigate('/login')} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading && !rawProfile) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white">
        <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-white/[0.04] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const Toggle = ({ label, desc, field, icon: Icon, iconColor }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={16} className="opacity-80" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-[#555] text-xs">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {savedKey === field && <CheckCircle size={14} className="text-emerald-400" />}
        <button
          onClick={() => toggle(field)}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${profile[field] ? "bg-red-600" : "bg-white/10"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile[field] ? "left-6" : "left-1"}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">

        {/* ── Header ── */}
        <PageHeader
          title="Settings"
          subtitle={user?.email}
          onRefresh={() => refetch()}
        />

        {/* ── Profile Card ── */}
        <div className="flex items-center gap-4 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-3xl p-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-900/80 to-red-600/40 border border-red-500/20 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold truncate">{user?.full_name || "User"}</p>
            <p className="text-[#666] text-sm truncate">{user?.email}</p>
            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${profile.subscription_plan === 'premium' ? 'bg-amber-500/15 text-amber-400' :
                profile.subscription_plan === 'standard' ? 'bg-red-500/15 text-red-400' :
                'bg-white/5 text-[#666]'}`}>
              <Crown size={10} />
              {(profile.subscription_plan || 'basic').charAt(0).toUpperCase() + (profile.subscription_plan || 'basic').slice(1)} Plan
            </div>
          </div>
        </div>

        {/* ── Device Panels ── */}
        <DevicePanel profile={profile} onSave={save} />
        <DeviceInfoPanel profile={profile} onSave={save} />

        {/* ── Safety Settings ── */}
        <div className="mb-6">
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3">Safety Settings</h2>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4">
            <Toggle label="Location Sharing" desc="Share GPS during emergencies" field="location_sharing" icon={MapPin} iconColor="bg-blue-500/15 text-blue-400" />
            <Toggle label="Auto-call 911" desc="Automatically call when SOS triggered" field="auto_call_911" icon={Phone} iconColor="bg-red-500/15 text-red-400" />
            <Toggle label="Safe Zone Alerts" desc="Notify when leaving safe zones" field="safe_zones_alerts" icon={Shield} iconColor="bg-emerald-500/15 text-emerald-400" />
            <Toggle label="Crime Alerts" desc="Area crime & safety notifications" field="crime_alerts" icon={Bell} iconColor="bg-amber-500/15 text-amber-400" />
          </div>
        </div>

        {/* ── Phone Number ── */}
        <div className="mb-6">
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3">Your Phone Number</h2>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[#555] text-xs mb-2">Used so others can find your device via "Find My Phone"</p>
            <input
              type="tel"
              value={profile.owner_phone || ""}
              onChange={e => setLocalProfile(p => ({ ...(p ?? rawProfile ?? defaultProfile), owner_phone: e.target.value }))}
              onBlur={() => save({ owner_phone: profile.owner_phone })}
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#444]"
              placeholder="e.g. 0821234567"
            />
          </div>
        </div>

        {/* ── Custom Alert Message ── */}
        <div className="mb-6">
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3">Custom Alert Message</h2>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
            <textarea
              value={profile.custom_alert_message || ""}
              onChange={e => setLocalProfile(p => ({ ...(p ?? rawProfile ?? defaultProfile), custom_alert_message: e.target.value }))}
              onBlur={() => save({ custom_alert_message: profile.custom_alert_message })}
              className="w-full bg-transparent text-white text-sm resize-none focus:outline-none"
              rows={3}
              placeholder="Your emergency message..."
            />
          </div>
        </div>

        {/* ── Subscription ── */}
        <SubscriptionPanel plan={profile.subscription_plan} onUpgrade={(plan) => save({ subscription_plan: plan })} />

        {/* ── Troubleshooting ── */}
        <div className="mb-6">
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <HelpCircle size={13} />
            Troubleshooting
          </h2>
          <div className="space-y-2">
            {TROUBLESHOOTING.map((item, idx) => {
              const Icon = item.icon;
              const open = openTrouble === idx;
              return (
                <div key={idx} className={`border rounded-2xl overflow-hidden transition-colors ${open ? item.bg : 'bg-white/[0.02] border-white/[0.07]'}`}>
                  <button
                    onClick={() => setOpenTrouble(open ? null : idx)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <Icon size={15} className={item.color} />
                    <span className="flex-1 text-white text-sm font-medium">{item.title}</span>
                    {open
                      ? <ChevronUp size={15} className="text-[#555] flex-shrink-0" />
                      : <ChevronDown size={15} className="text-[#555] flex-shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {item.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className={`text-[10px] font-bold mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg} ${item.color}`}>
                                {i + 1}
                              </span>
                              <p className="text-[#aaa] text-xs leading-relaxed">{step}</p>
                            </div>
                          ))}
                          {idx === 6 && (
                            <a
                              href="mailto:poomeigh503@gmail.com"
                              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-colors"
                            >
                              Contact Support →
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Legal ── */}
        <div className="flex justify-center gap-4 mb-4">
          <Link to="/privacy" className="text-[#555] text-xs hover:text-white transition-colors underline">Privacy Policy</Link>
          <Link to="/terms" className="text-[#555] text-xs hover:text-white transition-colors underline">Terms & Conditions</Link>
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 text-[#888] hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-[#333] text-xs mt-4">Panic Ring v2.1.0</p>
      </div>
    </div>
  );
}
