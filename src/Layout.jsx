import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, Settings, Smartphone, Watch } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, page: "Home" },
  { label: "Find", icon: Smartphone, page: "FindMyPhone", external: true },
  { label: "Map", icon: Map, page: "Map" },
  { label: "Watch", icon: Watch, page: "Watch", external: true },
  { label: "Settings", icon: Settings, page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="bg-[#0A0A0F] min-h-screen">
      <style>{`
        body { background: #0A0A0F; }
        * { -webkit-font-smoothing: antialiased; }
        .leaflet-container { background: #111 !important; }
      `}</style>

      {children}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D15]/95 backdrop-blur-xl border-t border-white/[0.06] px-2 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(({ label, icon: Icon, page, external }) => {
            const active = currentPageName === page;
            const linkTo = external ? `/${page}` : createPageUrl(page);
            return (
              <Link
                key={page}
                to={linkTo}
                className={`flex flex-col items-center gap-1 py-3 px-3 transition-all relative
                  ${active ? "text-white" : "text-[#444] hover:text-[#888]"}`}
              >
                {active && (
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-500 rounded-full" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}