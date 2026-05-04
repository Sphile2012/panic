import { Link } from "react-router-dom";
import { Map, Users, History, Watch, Phone, HelpCircle } from "lucide-react";

const actions = [
  { label: "Map", icon: Map, to: "/Map", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Contacts", icon: Users, to: "/Contacts", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "History", icon: History, to: "/AlertHistory", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "Watch", icon: Watch, to: "/Watch", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  { label: "Find Phone", icon: Phone, to: "/FindMyPhone", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { label: "Help", icon: HelpCircle, to: "/faq", color: "text-[#888]", bg: "bg-white/5 border-white/10" },
];

export default function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-white font-semibold text-sm mb-3">Quick Access</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ label, icon: Icon, to, color, bg }) => (
          <Link
            key={label}
            to={to}
            className={`border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${bg}`}
          >
            <Icon size={20} className={color} />
            <span className="text-[#888] text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}