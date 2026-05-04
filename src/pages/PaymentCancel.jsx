import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Payment Cancelled</h1>
        <p className="text-[#888] text-sm mb-8">No charge was made. You can try again anytime.</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/Subscriptions"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
