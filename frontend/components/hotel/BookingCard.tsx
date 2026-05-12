"use client";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Booking, Pet, Cage } from "@/lib/types";

interface Props {
  booking: Booking;
  pet: Pet | undefined;
  cage: Cage | undefined;
  onAction: (id: number, status: string) => void;
}

const fmt = (d: string) => {
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

export default function BookingCard({ booking, pet, cage, onAction }: Props) {
  const nights = (new Date(booking.check_out + "T00:00:00").getTime() - new Date(booking.check_in + "T00:00:00").getTime()) / 86400000;
  const isActive = booking.status === "Pending" || booking.status === "Confirmed";

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-medium text-sm">{pet?.name ?? `Pet #${booking.pet_id}`}</p>
          <p className="text-gray-500 text-xs">
            {pet?.species}{pet?.breed ? ` · ${pet.breed}` : ""}
          </p>
        </div>
        <Badge label={booking.status} />
      </div>

      <div className="text-xs">
        <span className="text-[#FFCC00] font-medium">{cage?.label ?? `Cage #${booking.cage_id}`}</span>
        {cage && <span className="text-gray-600"> · {cage.type} · {cage.size}</span>}
      </div>

      <div className="text-xs text-gray-500">
        {fmt(booking.check_in)} → {fmt(booking.check_out)}
        <span className="text-gray-600 ml-1">({nights}n)</span>
      </div>

      {booking.notes && (
        <p className="text-xs text-gray-600 italic truncate">"{booking.notes}"</p>
      )}

      <div className="flex gap-2 pt-1">
        {isActive && (
          <Button size="sm" onClick={() => onAction(booking.id, "Checked In")}>
            Check In
          </Button>
        )}
        {booking.status === "Checked In" && (
          <Button size="sm" onClick={() => onAction(booking.id, "Checked Out")}>
            Check Out
          </Button>
        )}
        {booking.status !== "Checked Out" && booking.status !== "Cancelled" && (
          <Button size="sm" variant="danger" onClick={() => onAction(booking.id, "Cancelled")}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
