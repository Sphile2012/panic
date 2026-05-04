import { Phone, Clock } from "lucide-react";
import { useState } from "react";

export default function FakeCallTrigger() {
  const [delay, setDelay] = useState(10);

  const triggerFakeCall = () => {
    setTimeout(() => {
      // Open fake call screen
      window.open('/FakeCall', '_blank');
    }, delay * 1000);
    alert(`Fake call scheduled in ${delay} seconds`);
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Phone size={16} className="text-green-400" />
        <h3 className="text-white font-semibold text-sm">Fake Call</h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-[#666]" />
        <span className="text-[#888] text-xs">Delay:</span>
        <select
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="bg-white/5 border border-white/10 text-white text-xs px-2 py-1 rounded-lg"
        >
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
        </select>
      </div>

      <button
        onClick={triggerFakeCall}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors text-sm"
      >
        <Phone size={16} />
        Schedule Fake Call
      </button>

      <p className="text-[#666] text-xs mt-2 text-center">
        Discreet exit from uncomfortable situations
      </p>
    </div>
  );
}