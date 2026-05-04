import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Crown, Zap, Shield, Check, Star, Lock, Loader2, ExternalLink } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { tokenStore } from "@/api/phumeClient";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 50, annual: 480 },
    icon: Shield,
    color: "border-white/10",
    iconColor: "text-slate-400",
    accentBg: "bg-white/[0.02]",
    highlight: false,
    features: [
      "3 emergency contacts",
      "Real-time GPS tracking",
      "SOS panic button alerts",
      "7-day alert history",
      "WhatsApp notifications",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: { monthly: 100, annual: 960 },
    icon: Zap,
    color: "border-red-500/50",
    iconColor: "text-red-400",
    accentBg: "bg-red-500/5",
    badge: "Most Popular",
    highlight: true,
    features: [
      "10 emergency contacts",
      "Real-time GPS tracking",
      "SOS panic button alerts",
      "30-day alert history",
      "WhatsApp & email alerts",
      "Audio recording",
      "Fall detection",
      "Offline mode",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: { monthly: 150, annual: 1440 },
    icon: Crown,
    color: "border-amber-500/40",
    iconColor: "text-amber-400",
    accentBg: "bg-amber-500/5",
    highlight: false,
    features: [
      "Unlimited contacts",
      "Real-time GPS tracking",
      "SOS panic button alerts",
      "Unlimited alert history",
      "WhatsApp & email alerts",
      "Audio recording",
      "Fall detection",
      "Offline mode",
      "Advanced analytics",
      "Priority 24/7 support",
      "Safe zone management",
      "Device tracking (family)",
    ],
  },
];

const isSandbox = import.meta.env.VITE_PAYFAST_SANDBOX !== 'false';
const isDev = import.meta.env.DEV;

export default function Subscriptions() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState("");

  // Auto-submit the hidden form once formData is set and the form has mounted
  useEffect(() => {
    if (formData && payfastUrl && formRef.current) {
      formRef.current.submit();
    }
  }, [formData, payfastUrl]);

  const getPrice = (plan) =>
    billing === "annual" ? plan.price.annual : plan.price.monthly;

  const getMonthlyEquiv = (plan) =>
    billing === "annual" ? Math.round(plan.price.annual / 12) : plan.price.monthly;

  const handleSelect = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(planId);
    setError("");

    try {
      const token = tokenStore.get();
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: planId, billing }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');

      setPayfastUrl(data.payfast_url);
      setFormData(data.data);
      // useEffect will auto-submit once the form mounts with the new data

    } catch (err) {
      console.error('PayFast error:', err);
      setError(err.message || 'Payment setup failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-28">

        <PageHeader title="Choose Your Plan" subtitle="Protect yourself & your loved ones" />

        {/* Sandbox / dev notice */}
        {(isDev || isSandbox) && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
            <p className="text-amber-400 text-xs font-semibold mb-1">🧪 Test Mode — PayFast Sandbox</p>
            <p className="text-amber-300/70 text-xs leading-relaxed">
              No real charges. Use these test card details on PayFast:
            </p>
            <div className="mt-2 bg-black/30 rounded-xl p-3 font-mono text-xs text-amber-200 space-y-1">
              <p>Card: <span className="text-white">4000 0000 0000 0002</span></p>
              <p>Expiry: <span className="text-white">12/25</span> &nbsp; CVV: <span className="text-white">123</span></p>
            </div>
            <a
              href="https://sandbox.payfast.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors"
            >
              <ExternalLink size={11} /> Open PayFast Sandbox Dashboard
            </a>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 flex gap-1">
            {["monthly", "annual"].map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  billing === b ? "bg-red-600 text-white shadow-lg" : "text-[#666] hover:text-white"
                }`}
              >
                {b}
                {b === "annual" && (
                  <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-4 text-red-400 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="space-y-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const monthlyEquiv = getMonthlyEquiv(plan);

            return (
              <div
                key={plan.id}
                className={`relative border rounded-3xl p-5 transition-all ${plan.color} ${plan.accentBg} ${
                  plan.highlight ? "shadow-lg shadow-red-500/10" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      <Star size={10} fill="white" /> {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${plan.color} bg-white/[0.03]`}>
                      <Icon size={20} className={plan.iconColor} />
                    </div>
                    <div>
                      <p className="text-white font-bold">{plan.name}</p>
                      <p className="text-[#555] text-xs">Safety plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-end gap-1">
                      <span className="text-[#555] text-sm">R</span>
                      <span className="text-white text-3xl font-black">{price}</span>
                      <span className="text-[#555] text-xs mb-1">
                        {billing === "annual" ? "/yr" : "/mo"}
                      </span>
                    </div>
                    {billing === "annual" && (
                      <p className="text-emerald-400 text-[10px]">
                        R{monthlyEquiv}/mo — save R{plan.price.monthly * 12 - plan.price.annual}/yr
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-1.5 mb-5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlight ? "bg-red-500/20" : "bg-white/[0.05]"
                      }`}>
                        <Check size={10} className={plan.iconColor} />
                      </div>
                      <span className="text-[#aaa] text-xs">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={!!loading}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30"
                      : plan.id === "premium"
                      ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                      : "bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.10]"
                  }`}
                >
                  {loading === plan.id ? (
                    <><Loader2 size={15} className="animate-spin" /> Redirecting to PayFast…</>
                  ) : (
                    <><Lock size={13} /> Pay R{price} with PayFast</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[#444] text-xs">
          <span className="flex items-center gap-1"><Lock size={11} /> Secured by PayFast</span>
          <span>🇿🇦 ZAR only</span>
          <span>Cancel anytime</span>
          <span>No hidden fees</span>
        </div>

        <p className="text-center text-[#333] text-xs mt-4">
          All plans include the Panic Ring core safety platform. No contracts.
        </p>
      </div>

      {/* Hidden PayFast form — auto-submitted via useEffect when formData is set */}
      <form
        ref={formRef}
        action={payfastUrl || 'https://sandbox.payfast.co.za/eng/process'}
        method="POST"
        style={{ display: 'none' }}
      >
        {formData && Object.entries(formData).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
      </form>
    </div>
  );
}
