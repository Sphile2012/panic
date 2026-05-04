import { Phone, Mail, Pencil, Trash2, Star, MessageSquare, PhoneCall } from "lucide-react";

const relationshipColors = {
  family: "text-rose-400 bg-rose-500/10",
  friend: "text-blue-400 bg-blue-500/10",
  colleague: "text-purple-400 bg-purple-500/10",
  neighbor: "text-amber-400 bg-amber-500/10",
  other: "text-[#666] bg-white/5",
};

export default function ContactCard({ contact, onEdit, onDelete }) {
  const relColor = relationshipColors[contact.relationship] || relationshipColors.other;
  const initials = contact.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-900/60 to-red-600/30 border border-red-500/20 flex items-center justify-center text-white font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold text-sm">{contact.name}</p>
          {contact.priority === 1 && <Star size={12} className="text-amber-400 fill-amber-400" />}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${relColor}`}>
            {contact.relationship || "other"}
          </span>
          <div className="flex items-center gap-1.5">
            {contact.notify_sms && (
              <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                <Phone size={10} /> SMS
              </span>
            )}
            <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
              <MessageSquare size={10} /> WhatsApp
            </span>
            {contact.notify_email && (
              <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                <Mail size={10} /> Email
              </span>
            )}
          </div>
        </div>
        <p className="text-[#666] text-xs mt-1">{contact.phone}</p>
      </div>
      <div className="flex flex-col gap-2">
        <a href={`tel:${contact.phone}`} className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
          <PhoneCall size={13} className="text-emerald-400" />
        </a>
        <button onClick={() => onEdit(contact)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Pencil size={13} className="text-[#888]" />
        </button>
        <button onClick={() => onDelete(contact.id)} className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors">
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}