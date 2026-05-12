"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Booking, Pet, Cage } from "@/lib/types";
import Button from "@/components/ui/Button";
import BookingCard from "@/components/hotel/BookingCard";
import BookingModal from "@/components/hotel/BookingModal";
import { useToast } from "@/lib/toast";

const TABS = ["All", "Active", "Checked In", "Checked Out", "Cancelled"] as const;
type Tab = typeof TABS[number];

function tabCount(bookings: Booking[], tab: Tab) {
  if (tab === "All") return bookings.length;
  if (tab === "Active") return bookings.filter((b) => b.status === "Pending" || b.status === "Confirmed").length;
  return bookings.filter((b) => b.status === tab).length;
}

export default function HotelPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [petMap, setPetMap] = useState<Record<number, Pet>>({});
  const [cageMap, setCageMap] = useState<Record<number, Cage>>({});
  const [tab, setTab] = useState<Tab>("All");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bk, pets, cages] = await Promise.all([
        api.get<Booking[]>("/bookings"),
        api.get<Pet[]>("/pets"),
        api.get<Cage[]>("/cages?active_only=false"),
      ]);
      setBookings(bk);
      const pm: Record<number, Pet> = {};
      pets.forEach((p) => (pm[p.id] = p));
      setPetMap(pm);
      const cm: Record<number, Cage> = {};
      cages.forEach((c) => (cm[c.id] = c));
      setCageMap(cm);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      showToast(`Status updated to ${status}`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update booking", "error");
    }
  };

  const filtered = bookings.filter((b) => {
    if (tab === "All") return true;
    if (tab === "Active") return b.status === "Pending" || b.status === "Confirmed";
    return b.status === tab;
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-semibold">Hotel</h1>
        <Button onClick={() => setShowModal(true)}>+ New Booking</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[#2a2a2a]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#FFCC00] text-[#FFCC00]"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
            <span className="ml-1.5 text-xs text-gray-600">({tabCount(bookings, t)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading && <p className="text-gray-600 text-sm">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-sm">No bookings here.</p>
          {tab === "All" && (
            <button
              onClick={() => setShowModal(true)}
              className="text-[#FFCC00] text-sm mt-2 hover:underline"
            >
              Create first booking →
            </button>
          )}
        </div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              pet={petMap[b.pet_id]}
              cage={cageMap[b.cage_id]}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}
