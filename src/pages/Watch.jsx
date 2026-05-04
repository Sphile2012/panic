import { useState, useEffect } from "react";
import { auth } from "@/api/client";
import { Watch as WatchIcon } from "lucide-react";
import WatchDashboard from "@/components/smartwatch/WatchDashboard";
import FallDetection from "@/components/smartwatch/FallDetection";
import PageHeader from "@/components/ui/PageHeader";

export default function WatchPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        <PageHeader title="Smartwatch" subtitle="Live health monitoring & fall detection" />

        <WatchDashboard user={user} />
      </div>
    </div>
  );
}