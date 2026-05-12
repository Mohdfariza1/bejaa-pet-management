"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  owners: number;
  pets: number;
  active_bookings: number;
  checkins_today: number;
  checkouts_today: number;
  overdue_vaccines: number;
}

const CARDS = [
  { key: "owners",           label: "Total Owners",       icon: "◎", accent: "text-white" },
  { key: "pets",             label: "Total Pets",          icon: "🐾", accent: "text-white" },
  { key: "active_bookings",  label: "Active Bookings",     icon: "▦", accent: "text-[#FFCC00]" },
  { key: "checkins_today",   label: "Check-ins Today",     icon: "↓", accent: "text-green-400" },
  { key: "checkouts_today",  label: "Check-outs Today",    icon: "↑", accent: "text-blue-400" },
  { key: "overdue_vaccines", label: "Overdue Vaccines",    icon: "✚", accent: "text-red-400" },
] as const;

const today = new Date().toLocaleDateString("en-MY", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>("/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-white text-xl font-semibold">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">{today}</p>
      </div>

      {loading && <p className="text-gray-600 text-sm">Loading stats...</p>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map(({ key, label, icon, accent }) => (
            <div key={key} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs">{label}</p>
                <span className="text-gray-700 text-base leading-none">{icon}</span>
              </div>
              <p className={`text-3xl font-bold ${accent}`}>{stats[key]}</p>
            </div>
          ))}
        </div>
      )}

      {stats && stats.overdue_vaccines > 0 && (
        <div className="mt-6 bg-red-950/40 border border-red-900/60 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-red-400 text-sm font-medium">
            ⚠ {stats.overdue_vaccines} vaccine{stats.overdue_vaccines > 1 ? "s" : ""} overdue — check the Clinic module.
          </span>
        </div>
      )}

      {stats && stats.checkins_today > 0 && (
        <div className="mt-3 bg-green-950/40 border border-green-900/60 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-green-400 text-sm font-medium">
            {stats.checkins_today} pet{stats.checkins_today > 1 ? "s" : ""} checking in today — see Hotel.
          </span>
        </div>
      )}
    </div>
  );
}
