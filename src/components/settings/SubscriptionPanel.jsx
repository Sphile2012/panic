import { Crown, Zap, Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "R50/mo",
    color: "border-white/10",
    features: ["3 emergency contacts", "Real-time GPS tracking", "SOS alerts", "7-day history"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "R100/mo",
    color: "border-red-500/40",
    accent: "text-red-400",
    badge: "Most Popular",
    features: ["10 emergency contacts", "Video recording", "WhatsApp alerts", "30-day history", "Fall detection"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "R150/mo",
    color: "border-teal-500/40",
    accent: "text-teal-400",
    features: ["Unlimited contacts", "Priority 24/7 support", "Advanced analytics", "Unlimited history"],
  },
];

export default function SubscriptionPanel({ plan, onUpgrade }) {
  return (
    <div className="mb-6">
      <h2 className="text-[#666] text-xs uppercase tracking-widest mb-4">Subscription Plan</h2>
      <div className="space-y-3">
        {plans.map(p => (
          <div
            key={p.id}
            className={`border rounded-2xl p-4 transition-all ${p.color} ${plan === p.id ? "bg-white/[0.06]" : "bg-white/[0.02]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {p.id === "premium" ? <Crown size={16} className="text-amber-400" /> : <Zap size={16} className={p.accent || "text-[#666]"} />}
                <span className={`font-bold text-sm ${p.accent || "text-white"}`}>{p.name}</span>
                {p.badge && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">{p.badge}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold">{p.price}</span>
                {plan === p.id ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : (
                  <Link
                    to="/Subscriptions"
                    className={`text-xs px-3 py-1 rounded-full border transition-colors
                      ${p.id === 'premium' ? 'border-teal-500/40 text-teal-400 hover:bg-teal-500/10' :
                        p.id === 'standard' ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' :
                        'border-white/10 text-[#888] hover:bg-white/5'}`}
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.features.map(f => (
                <span key={f} className="text-[#666] text-xs flex items-center gap-1">
                  <Check size={10} className={p.accent || "text-[#666]"} /> {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}