import { Bluetooth, Shield, Crown, Zap } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const planConfig = {
  premium: { icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Premium" },
  standard: { icon: Zap, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Standard" },
  basic: { icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "Basic" },
};

export default function StatusBar({ user, profile, loading, contactCount = 0 }) {
  if (loading) return (
    <div className="mb-8">
      <div className="h-4 w-28 bg-white/5 rounded-lg animate-pulse mb-2" />
      <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
    </div>
  );

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const plan = planConfig[profile?.subscription_plan] || planConfig.basic;
  const PlanIcon = plan.icon;

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{getGreeting()}, {firstName} 👋</h1>
          <p className="text-[#444] text-xs mt-1">Stay safe, stay protected</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full ${plan.bg}`}>
            <PlanIcon size={12} className={plan.color} />
            <span className={`text-xs font-medium ${plan.color}`}>{plan.label}</span>
          </div>
          {profile?.device_connected ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <Bluetooth size={10} className="text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">Ring Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Bluetooth size={10} className="text-[#444]" />
              <span className="text-[#444] text-[10px]">No Ring</span>
            </div>
          )}
        </div>
      </div>
      {/* Quick status pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border ${
          contactCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {contactCount > 0 ? `✓ ${contactCount} contact${contactCount !== 1 ? 's' : ''} ready` : '⚠ No contacts set'}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border ${
          profile?.location_sharing ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-[#555]'
        }`}>
          {profile?.location_sharing ? '📍 GPS On' : '📍 GPS Off'}
        </div>
      </div>
    </div>
  );
}