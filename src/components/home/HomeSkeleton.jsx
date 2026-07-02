export default function HomeSkeleton() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(180deg, #C5E8EE 0%, #D8F0F5 40%, #BFE8EF 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(255,255,255,0.55)" }}>
        <div className="h-7 w-36 rounded-lg animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
        <div className="h-6 w-6 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
      </div>

      {/* Stats row */}
      <div className="flex justify-around px-4 py-4"
        style={{ background: "rgba(255,255,255,0.35)" }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-3 w-16 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
            <div className="w-9 h-12 rounded-full animate-pulse" style={{ background: "rgba(42,180,180,0.3)" }} />
            <div className="h-3 w-12 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
          </div>
        ))}
      </div>

      {/* Safety % */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="h-24 w-48 rounded-2xl animate-pulse" style={{ background: "rgba(74,184,196,0.2)" }} />
        <div className="h-8 w-36 rounded-xl animate-pulse" style={{ background: "rgba(74,184,196,0.15)" }} />
        <div className="h-4 w-48 rounded animate-pulse" style={{ background: "rgba(74,184,196,0.1)" }} />
      </div>

      {/* Bottom circles */}
      <div className="relative h-52 flex-shrink-0">
        <div className="absolute" style={{ bottom: 52, left: "calc(50% - 130px)", width: 120, height: 120, borderRadius: "50%", background: "rgba(220,64,64,0.3)" }} />
        <div className="absolute" style={{ bottom: 36, left: "50%", transform: "translateX(-50%)", width: 160, height: 160, borderRadius: "50%", background: "rgba(220,64,64,0.35)" }} />
        <div className="absolute" style={{ bottom: 76, right: "calc(50% - 150px)", width: 72, height: 72, borderRadius: "50%", background: "rgba(180,180,180,0.3)" }} />
      </div>
      <div style={{ height: 64 }} />
    </div>
  );
}
