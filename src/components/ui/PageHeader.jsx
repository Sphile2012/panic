import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  action,
  className = "",
}) {
  const navigate = useNavigate();

  const btnBase =
    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0 border";

  return (
    <div className={`flex items-center gap-2 mb-6 ${className}`}>

      {/* ← Back */}
      <button
        onClick={() => navigate(-1)}
        className={`${btnBase} bg-white/10 border-white/20 hover:bg-white/20 text-white`}
        aria-label="Go back"
        title="Back"
      >
        <ArrowLeft size={18} />
      </button>

      {/* → Forward */}
      <button
        onClick={() => navigate(1)}
        className={`${btnBase} bg-white/10 border-white/20 hover:bg-white/20 text-white`}
        aria-label="Go forward"
        title="Forward"
      >
        <ArrowRight size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0 ml-1">
        <h1 className="text-xl font-bold text-white leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-[#666] text-xs mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`${btnBase} bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-40`}
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin text-teal-400" : ""} />
        </button>
      )}

      {/* Custom action (e.g. Add button) */}
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className={`${btnBase} bg-red-600 border-red-500 hover:bg-red-500 text-white disabled:opacity-40`}
          aria-label={action.label}
          title={action.label}
        >
          <action.icon size={18} />
        </button>
      )}
    </div>
  );
}
