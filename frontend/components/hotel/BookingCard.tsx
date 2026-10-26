"use client";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
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

const SPECIES_ICON: Record<string, string> = { Dog: "🐶", Cat: "🐱", Bird: "🐦", Rabbit: "🐰", Hamster: "🐹", Fish: "🐟" };

export default function BookingCard({ booking, pet, cage, onAction }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const nights = (new Date(booking.check_out + "T00:00:00").getTime() - new Date(booking.check_in + "T00:00:00").getTime()) / 86400000;
  const isActive = booking.status === "Pending" || booking.status === "Confirmed";
  const petName = pet?.name ?? `Pet #${booking.pet_id}`;

  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-soft text-xl">{SPECIES_ICON[pet?.species ?? ""] ?? "🐾"}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-ink font-semibold">{petName}</span>
            <Badge label={booking.status} />
            {pet?.alert && (
              <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-red-50 text-red-700 max-w-full">
                <Icon name="alert" className="w-3 h-3 shrink-0" />{pet.alert}
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5 sm:truncate">
            {cage?.label ?? `Cage #${booking.cage_id}`} · {fmt(booking.check_in)} → {fmt(booking.check_out)} · {nights} night{nights === 1 ? "" : "s"}
            {booking.notes && <> · <span className="italic">{booking.notes}</span></>}
          </p>
        </div>
      </div>

      {confirmCancel ? (
        <div className="flex items-center gap-2 shrink-0 sm:pl-0 pl-14">
          <span className="text-sm text-ink">Cancel {petName}&apos;s stay?</span>
          <Button size="sm" variant="danger" onClick={() => onAction(booking.id, "Cancelled")}>Yes, cancel</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>Keep</Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0 sm:pl-0 pl-14">
          {booking.status !== "Checked Out" && booking.status !== "Cancelled" && (
            <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel</Button>
          )}
          {isActive && <Button size="sm" onClick={() => onAction(booking.id, "Checked In")}>Check in</Button>}
          {booking.status === "Checked In" && <Button size="sm" onClick={() => onAction(booking.id, "Checked Out")}>Send home</Button>}
        </div>
      )}
    </li>
  );
}
