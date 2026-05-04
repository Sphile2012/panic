import { useState, useEffect, Fragment } from "react";
import { entities } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Shield, Trash2, Bell, BellOff } from "lucide-react";
import SafeZoneCreator from "@/components/map/SafeZoneCreator";
import PageHeader from "@/components/ui/PageHeader";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const tealIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const typeColors = {
  home: "#14b8a6",
  work: "#6366f1",
  school: "#f59e0b",
  police: "#3b82f6",
  hospital: "#ef4444",
  fire_station: "#f97316",
  security: "#8b5cf6",
  other: "#10b981",
};

export default function Map() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [location, setLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        err => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    Promise.all([
      entities.Alert.filter({ owner_email: user.email, status: "active" }),
      entities.SafeZone.filter({ owner_email: user.email }),
    ]).then(([alertData, zoneData]) => {
      setAlerts(alertData);
      setSafeZones(zoneData);
      setLoading(false);
    });
  }, [isAuthenticated, user]);

  const handleSaveZone = async (zoneData) => {
    if (!user) return;
    const created = await entities.SafeZone.create({ ...zoneData, owner_email: user.email });
    setSafeZones(prev => [...prev, created]);
    setCreating(false);
  };

  const handleDeleteZone = async (zoneId) => {
    setDeleting(zoneId);
    await entities.SafeZone.delete(zoneId);
    setSafeZones(prev => prev.filter(z => z.id !== zoneId));
    setDeleting(null);
  };

  const center = location || { lat: -26.2041, lng: 28.0473 };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <PageHeader
          title="Live Map"
          subtitle="Your location & safe zones"
          action={{ icon: Plus, onClick: () => setCreating(true), label: "Add zone", disabled: creating }}
        />

        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#888]">
            <div className="w-3 h-3 bg-blue-500 rounded-full" /> You
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#888]">
            <div className="w-3 h-3 bg-red-500 rounded-full" /> Active alert
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#888]">
            <div className="w-3 h-3 bg-teal-400 rounded-full" /> Safe zone
          </div>
        </div>

        {/* Map */}
        <div className="rounded-3xl overflow-hidden border border-white/10 relative" style={{ height: 420 }}>
          <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />

            {/* User location */}
            {location && (
              <>
                <Marker position={[location.lat, location.lng]}>
                  <Popup>📍 You are here{location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ""}</Popup>
                </Marker>
                <Circle center={[location.lat, location.lng]} radius={location.accuracy || 30} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.15} />
              </>
            )}

            {/* Active alerts */}
            {alerts.filter(a => a.latitude && a.longitude).map(alert => (
              <Marker key={alert.id} position={[alert.latitude, alert.longitude]} icon={redIcon}>
                <Popup>🚨 Active Alert<br />{alert.message}</Popup>
              </Marker>
            ))}

            {/* Safe zones */}
            {safeZones.filter(z => z.latitude && z.longitude).map(zone => {
              const color = typeColors[zone.type] || "#14b8a6";
              return (
                <Fragment key={zone.id}>
                  <Circle
                    center={[zone.latitude, zone.longitude]}
                    radius={zone.radius || 200}
                    color={color}
                    fillColor={color}
                    fillOpacity={0.12}
                    weight={2}
                  />
                  <Marker position={[zone.latitude, zone.longitude]} icon={tealIcon}>
                    <Popup>
                      <strong>{zone.name}</strong><br />
                      Type: {zone.type?.replace("_", " ")}<br />
                      Radius: {zone.radius || 200}m<br />
                      {zone.alert_on_exit ? "✅ Exit alerts ON" : "❌ Exit alerts OFF"}
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}

            {/* Zone creator tool */}
            {creating && (
              <SafeZoneCreator onSave={handleSaveZone} onCancel={() => setCreating(false)} />
            )}
          </MapContainer>
        </div>

        {/* My Safe Zones list */}
        <div className="mt-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield size={16} className="text-teal-400" />
            My Safe Zones
            <span className="text-[#666] text-xs font-normal">({safeZones.length})</span>
          </h2>

          {safeZones.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-center">
              <Shield size={32} className="mx-auto text-[#333] mb-3" />
              <p className="text-[#666] text-sm">No safe zones yet</p>
              <p className="text-[#444] text-xs mt-1">Tap "Add Zone" to define a boundary. You'll be alerted if you leave it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {safeZones.map(z => {
                const color = typeColors[z.type] || "#14b8a6";
                return (
                  <div key={z.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20", borderColor: color + "40", border: "1px solid" }}>
                      <Shield size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{z.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[#555] text-xs capitalize">{z.type?.replace("_", " ")} · {z.radius || 200}m</span>
                        {z.alert_on_exit
                          ? <span className="flex items-center gap-1 text-teal-400 text-[10px]"><Bell size={9} /> Alerts on</span>
                          : <span className="flex items-center gap-1 text-[#555] text-[10px]"><BellOff size={9} /> Alerts off</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteZone(z.id)}
                      disabled={deleting === z.id}
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}