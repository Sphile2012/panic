import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, CheckCircle, AlertCircle, XCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig = {
  active: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500", label: "Active" },
  resolved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500", label: "Resolved" },
  false_alarm: { icon: XCircle, color: "text-[#555]", bg: "bg-white/5 border-white/10", dot: "bg-[#555]", label: "False Alarm" },
};

export default function RecentAlerts({ alerts }) {
  if (alerts.length === 0) return (
    <div className="text-center py-10">
      <CheckCircle size={32} className="text-emerald-500/40 mx-auto mb-3" />
      <p className="text-[#555] text-sm">No alerts yet — stay safe! 💚</p>
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm">Recent Alerts</h2>
        <Link to="/AlertHistory" className="text-xs text-[#555] hover:text-white transition-colors flex items-center gap-0.5">
          View all <ChevronRight size={12} />
        </Link>
      </div>
      <div className="space-y-2">
        {alerts.slice(0, 3).map(alert => {
          const cfg = statusConfig[alert.status] || statusConfig.resolved;
          return (
            <div key={alert.id} className={`border rounded-2xl p-4 flex items-center gap-3 ${cfg.bg}`}>
              <div className="flex-shrink-0 relative">
                <cfg.icon size={18} className={cfg.color} />
                {alert.status === "active" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {alert.message?.slice(0, 45) || "Emergency Alert"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {alert.address && (
                    <span className="flex items-center gap-1 text-[#555] text-[10px]">
                      <MapPin size={9} /> {alert.address.slice(0, 20)}...
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#555] text-[10px]">
                    <Clock size={9} />
                    {formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}