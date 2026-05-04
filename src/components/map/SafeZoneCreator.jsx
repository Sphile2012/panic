import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { X, MapPin } from "lucide-react";

// Invisible layer that captures map clicks when in drawing mode
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function SafeZoneCreator({ onSave, onCancel }) {
  const [pending, setPending] = useState(null); // { lat, lng }
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(200);
  const [type, setType] = useState("home");
  const [saving, setSaving] = useState(false);

  const handleMapClick = (latlng) => {
    if (!pending) setPending(latlng);
  };

  const handleSave = async () => {
    if (!pending || !name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), type, latitude: pending.lat, longitude: pending.lng, radius, alert_on_exit: true });
    setSaving(false);
  };

  return (
    <>
      <MapClickHandler onMapClick={handleMapClick} />

      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-2xl">
        {!pending ? (
          <div className="text-center">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold text-sm">📍 Tap anywhere on the map to place your Safe Zone</p>
              <button onClick={onCancel} className="text-[#888] hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-[#666] text-xs">The zone will alert your contacts if you leave it</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold text-sm flex items-center gap-1"><MapPin size={14} className="text-red-400" /> Zone placed — fill in details</p>
              <button onClick={onCancel} className="text-[#888] hover:text-white"><X size={16} /></button>
            </div>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Zone name (e.g. Home, Work)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder-[#444]"
              autoFocus
            />

            <div className="flex gap-2">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              >
                {["home","work","school","police","hospital","fire_station","security","other"].map(t => (
                  <option key={t} value={t} className="bg-[#111]">{t.replace("_"," ")}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1">
                <span className="text-[#888] text-xs">Radius</span>
                <input
                  type="number"
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  min={50}
                  max={5000}
                  step={50}
                  className="w-full bg-transparent text-white text-sm focus:outline-none text-right"
                />
                <span className="text-[#888] text-xs">m</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-xl bg-white/5 text-[#888] text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {saving ? "Saving..." : "Save Zone"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}