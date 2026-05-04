import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactForm({ contact, onSave, onClose }) {
  const [form, setForm] = useState({
    name: contact?.name || "",
    phone: contact?.phone || "",
    email: contact?.email || "",
    relationship: contact?.relationship || "friend",
    priority: contact?.priority || 1,
    notify_sms: contact?.notify_sms ?? true,
    notify_email: contact?.notify_email ?? true,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[+\d\s\-()]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-500/50 transition-colors";
  const labelCls = "text-[#888] text-xs mb-1.5 block uppercase tracking-wider";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111118] border border-white/10 rounded-3xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{contact ? "Edit Contact" : "Add Contact"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <X size={16} className="text-[#888]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input className={`${inputCls} ${errors.name ? 'border-red-500/60' : ''}`} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Doe" />
            {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
          </div>
          <div>
            <label className={labelCls}>Phone Number *</label>
            <input className={`${inputCls} ${errors.phone ? 'border-red-500/60' : ''}`} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+27 82 000 0000" />
            {errors.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@email.com" />
          </div>
          <div>
            <label className={labelCls}>Relationship</label>
            <select className={inputCls} value={form.relationship} onChange={e => set("relationship", e.target.value)}>
              {["family","friend","colleague","neighbor","other"].map(r => (
                <option key={r} value={r} className="bg-[#111118]">{r.charAt(0).toUpperCase()+r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Priority Order</label>
            <input type="number" min={1} max={10} className={inputCls} value={form.priority} onChange={e => set("priority", parseInt(e.target.value))} />
          </div>
          <div className="flex gap-4">
            {[["notify_sms", "SMS Alerts"], ["notify_email", "Email Alerts"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => set(key, !form[key])}
                  className={`w-10 h-6 rounded-full transition-colors ${form[key] ? "bg-red-600" : "bg-white/10"} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[key] ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-[#888] text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (validate()) onSave(form); }}
          disabled={false}
          className="mt-6 w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors"
        >
          {contact ? "Save Changes" : "Add Contact"}
        </button>
      </motion.div>
    </motion.div>
  );
}