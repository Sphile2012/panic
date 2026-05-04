import { Users, Bell, ShieldCheck, TrendingUp } from "lucide-react";

export default function QuickStats({ alerts, contacts }) {
  const resolved = alerts.filter(a => a.status === "resolved").length;
  const active = alerts.filter(a => a.status === "active").length;
  const safetyScore = contacts.length === 0 ? 30 : Math.min(100, 40 + contacts.length * 10 + resolved * 5);

  return (
    <div className="mb-8">
      {/* Safety Score */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-white text-sm font-semibold">Safety Score</span>
          </div>
          <span className="text-emerald-400 font-black text-xl">{safetyScore}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${safetyScore}%` }}
          />
        </div>
        <p className="text-[#555] text-[10px] mt-1.5">
          {contacts.length === 0 ? "Add emergency contacts to improve your score" :
           safetyScore >= 80 ? "Excellent protection setup" :
           safetyScore >= 60 ? "Good — consider upgrading your plan" :
           "Add more contacts to improve safety"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="border border-blue-500/20 rounded-2xl p-4 bg-blue-500/5">
          <Users size={16} className="text-blue-400" />
          <p className="text-2xl font-bold text-white mt-2">{contacts.length}</p>
          <p className="text-[#555] text-xs mt-0.5">Contacts</p>
        </div>
        <div className="border border-red-500/20 rounded-2xl p-4 bg-red-500/5">
          <Bell size={16} className={active > 0 ? "text-red-400" : "text-[#555]"} />
          <p className="text-2xl font-bold text-white mt-2">{alerts.length}</p>
          <p className="text-[#555] text-xs mt-0.5">Total Alerts</p>
          {active > 0 && <span className="text-[10px] text-red-400 font-medium">{active} active</span>}
        </div>
        <div className="border border-emerald-500/20 rounded-2xl p-4 bg-emerald-500/5">
          <ShieldCheck size={16} className="text-emerald-400" />
          <p className="text-2xl font-bold text-white mt-2">{resolved}</p>
          <p className="text-[#555] text-xs mt-0.5">Resolved</p>
        </div>
      </div>
    </div>
  );
}