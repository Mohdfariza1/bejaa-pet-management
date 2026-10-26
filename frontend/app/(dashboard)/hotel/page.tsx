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
const TAB_WORDS: Record<Tab, string> = { All: "All", Active: "Coming", "Checked In": "Staying now", "Checked Out": "Gone home", Cancelled: "Cancelled" };
const DONE_WORDS: Record<string, string> = { "Checked In": "checked in", "Checked Out": "sent home", Cancelled: "booking cancelled" };

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
      showToast(`${petMap[bookings.find((b) => b.id === id)?.pet_id ?? 0]?.name ?? "Booking"} ${DONE_WORDS[status] ?? status} ✓`);
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
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ink text-2xl font-bold">Boarding</h1>
        <Button onClick={() => setShowModal(true)}>+ New booking</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? "bg-ink text-white"
                : "bg-card text-muted hover:text-ink"
            }`}
          >
            {TAB_WORDS[t]}
            <span className={`ml-1.5 ${tab === t ? "text-white/70" : "text-muted"}`}>{tabCount(bookings, t)}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading && <p className="text-muted text-sm">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">No bookings here.</p>
          {tab === "All" && (
            <button
              onClick={() => setShowModal(true)}
              className="text-brand text-sm mt-2 hover:underline"
            >
              Make a booking →
            </button>
          )}
        </div>
      )}
      {!loading && filtered.length > 0 && (
        <ul className="bg-card rounded-2xl border border-line divide-y divide-line overflow-hidden">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              pet={petMap[b.pet_id]}
              cage={cageMap[b.cage_id]}
              onAction={handleAction}
            />
          ))}
        </ul>
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
