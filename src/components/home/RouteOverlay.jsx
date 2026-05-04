import { useEffect, useState } from "react";
import { Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const policeIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:#3b82f6;border:2px solid #fff;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:14px;line-height:1">🚓</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const hospitalIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:#ec4899;border:2px solid #fff;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:14px;line-height:1">🏥</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Query Overpass for nearest police or hospital within 5km
async function findNearest(lat, lon) {
  const radius = 5000;
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="police"](around:${radius},${lat},${lon});
      node["amenity"="hospital"](around:${radius},${lat},${lon});
    );
    out body 20;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  const data = await res.json();
  const elements = data.elements || [];
  if (!elements.length) return null;

  // Pick the closest one
  const withDist = elements.map((e) => ({
    ...e,
    dist: Math.hypot(e.lat - lat, e.lon - lon),
  }));
  withDist.sort((a, b) => a.dist - b.dist);
  return withDist[0];
}

// Get OSRM route (open, no key needed)
async function getRoute(fromLat, fromLon, toLat, toLon) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) return null;
  // GeoJSON coords are [lon, lat], convert to [lat, lon] for Leaflet
  const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  const duration = Math.round(route.duration / 60); // minutes
  return { coords, duration, distance: (route.distance / 1000).toFixed(1) };
}

// Simple in-memory cache so repeated renders don't re-fetch
const routeCache = {};

export default function RouteOverlay({ alert }) {
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (!alert?.latitude || !alert?.longitude) return;

    const cacheKey = `${alert.latitude},${alert.longitude}`;
    if (routeCache[cacheKey]) {
      const cached = routeCache[cacheKey];
      setDestination(cached.destination);
      setRoute(cached.route);
      return;
    }

    let cancelled = false;
    setDestination(null);
    setRoute(null);
    setLoading(true);

    (async () => {
      const nearest = await findNearest(alert.latitude, alert.longitude);
      if (cancelled || !nearest) { setLoading(false); return; }

      setDestination(nearest);

      const routeData = await getRoute(
        alert.latitude, alert.longitude,
        nearest.lat, nearest.lon
      );
      if (cancelled) return;
      setLoading(false);
      if (!routeData) return;
      setRoute(routeData);

      // Cache result
      routeCache[cacheKey] = { destination: nearest, route: routeData };

      try {
        const bounds = L.latLngBounds([
          [alert.latitude, alert.longitude],
          [nearest.lat, nearest.lon],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [alert?.id]);

  const isPolice = destination?.tags?.amenity === "police";
  const destName = destination?.tags?.name || (isPolice ? "Police Station" : "Hospital");

  return (
    <>
      {route && (
        <Polyline
          positions={route.coords}
          pathOptions={{ color: "#facc15", weight: 4, opacity: 0.85, dashArray: "8 5" }}
        />
      )}
      {destination && (
        <Marker
          position={[destination.lat, destination.lon]}
          icon={isPolice ? policeIcon : hospitalIcon}
        >
          <Popup>
            <div style={{ minWidth: 150 }}>
              <p style={{ fontWeight: 700, marginBottom: 4, color: isPolice ? "#3b82f6" : "#ec4899" }}>
                {isPolice ? "🚓" : "🏥"} {destName}
              </p>
              {route && (
                <p style={{ fontSize: 11, color: "#555" }}>
                  ~{route.duration} min · {route.distance} km away
                </p>
              )}
              <a
                href={`https://www.google.com/maps/dir/${alert.latitude},${alert.longitude}/${destination.lat},${destination.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#3b82f6" }}
              >
                Open in Google Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}