import { useState } from "react";
import { Check } from "lucide-react";

const plans = {
  monthly: [
    {
      name: "Basic",
      price: "R50",
      period: "/month",
      desc: "Essential safety features",
      features: [
        "Up to 3 Emergency Contacts",
        "Real-time GPS Tracking",
        "SOS Alert System",
        "SMS Notifications",
        "Location History (7 days)",
      ],
      cta: "Start Free Trial",
      highlight: false,
      accent: "border-white/10 bg-[#141820]",
      ctaClass: "border border-white/20 text-white hover:bg-white/5",
    },
    {
      name: "Standard",
      price: "R100",
      period: "/month",
      desc: "Complete protection package",
      features: [
        "Up to 10 Emergency Contacts",
        "Real-time GPS Tracking",
        "Video Recording During SOS",
        "Fall Detection Alerts",
        "SMS & WhatsApp Notifications",
        "Location History (30 days)",
      ],
      cta: "Start Free Trial",
      highlight: true,
      badge: "MOST POPULAR",
      accent: "border-red-500/60 bg-red-600",
      ctaClass: "bg-white text-red-600 font-bold hover:bg-red-50",
    },
    {
      name: "Premium",
      price: "R150",
      period: "/month",
      desc: "Essential safety features",
      features: [
        "Unlimited Emergency Contacts",
        "Real-time GPS Tracking",
        "Video Recording During SOS",
        "Fall Detection Alerts",
        "SMS & WhatsApp Notifications",
        "Unlimited Location History",
        "Priority 24/7 Support",
        "Advanced Analytics Dashboard",
      ],
      cta: "Start Free Trial",
      highlight: false,
      accent: "border-white/10 bg-[#141820]",
      ctaClass: "border border-white/20 text-white hover:bg-white/5",
    },
  ],
};

// Yearly pricing = monthly * 12 * 0.7 (30% off)
const yearlyPlans = plans.monthly.map(p => ({
  ...p,
  price: `R${Math.round(parseInt(p.price.replace("R", "")) * 12 * 0.7)}`,
  period: "/year",
}));

export default function PricingSection({ onSelectPlan }) {
  const [billing, setBilling] = useState("monthly");
  const activePlans = billing === "monthly" ? plans.monthly : yearlyPlans;

  return (
    <section className="py-20 px-6 bg-[#0d1117]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-white text-center mb-2">
          Simple, Transparent Pricing
        </h2>
        <p className="text-[#8a9ab0] text-center mb-8 text-sm">
          Choose the plan that fits your needs. All plans include core safety features with 3 days free trial.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === "monthly"
                ? "bg-red-500 text-white"
                : "text-[#8a9ab0] hover:text-white"
            }`}
          >
            Monthly
          </button>
          <div className="relative">
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-red-500 text-white"
                  : "text-[#8a9ab0] hover:text-white"
              }`}
            >
              Yearly
            </button>
            {billing === "yearly" && (
              <span className="absolute -top-2 -right-6 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                -30%
              </span>
            )}
            {billing === "monthly" && (
              <span className="absolute -top-2 -right-6 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                -30%
              </span>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {activePlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col ${plan.accent} ${
                plan.highlight ? "scale-105 shadow-2xl shadow-red-500/20 z-10" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-white font-black text-xl mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-white font-black text-4xl">{plan.price}</span>
                <span className="text-white/70 text-sm mb-1">{plan.period}</span>
              </div>
              <p className="text-white/60 text-xs mb-6">{plan.desc}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                    <Check size={15} className="text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan?.(plan.name)}
                className={`w-full py-3 rounded-full text-sm font-semibold transition-all ${plan.ctaClass}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}