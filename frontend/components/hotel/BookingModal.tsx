"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Cage, Pet } from "@/lib/types";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function BookingModal({ onClose, onCreated }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availableCages, setAvailableCages] = useState<Cage[]>([]);
  const [selectedCageId, setSelectedCageId] = useState<number | null>(null);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [petQuery, setPetQuery] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [showPetList, setShowPetList] = useState(false);
  const [notes, setNotes] = useState("");
  const [cagesLoading, setCagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Pet[]>("/pets").then(setAllPets).catch(() => {});
  }, []);

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setAvailableCages([]);
      setSelectedCageId(null);
      return;
    }
    setCagesLoading(true);
    api.get<Cage[]>(`/cages/available?check_in=${checkIn}&check_out=${checkOut}`)
      .then((data) => { setAvailableCages(data); setSelectedCageId(null); })
      .catch(() => setAvailableCages([]))
      .finally(() => setCagesLoading(false));
  }, [checkIn, checkOut]);

  const filteredPets = petQuery
    ? allPets.filter((p) => p.name.toLowerCase().includes(petQuery.toLowerCase()))
    : allPets;

  const submit = async () => {
    if (!checkIn || !checkOut || !selectedCageId || !selectedPetId) {
      setError("Dates, cage, and pet are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/bookings", {
        pet_id: selectedPetId,
        cage_id: selectedCageId,
        check_in: checkIn,
        check_out: checkOut,
        notes: notes || null,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Booking" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Check-In *"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <Input
            label="Check-Out *"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        {/* Available Cages */}
        {checkIn && checkOut && checkOut > checkIn && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              {cagesLoading ? "Checking availability..." : `${availableCages.length} cage(s) available`}
            </p>
            {!cagesLoading && availableCages.length === 0 && (
              <p className="text-red-400 text-xs">No cages available for these dates.</p>
            )}
            {!cagesLoading && availableCages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {availableCages.map((cage) => (
                  <button
                    key={cage.id}
                    onClick={() => setSelectedCageId(cage.id)}
                    className={`p-2 rounded border text-left transition-colors ${
                      selectedCageId === cage.id
                        ? "border-[#FFCC00] bg-yellow-900/20"
                        : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a]"
                    }`}
                  >
                    <p className="text-white text-xs font-medium">{cage.label}</p>
                    <p className="text-gray-500 text-xs">{cage.type} · {cage.size}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pet selector */}
        <div className="relative">
          <Input
            label="Pet *"
            placeholder="Type to search pet..."
            value={petQuery}
            onChange={(e) => {
              setPetQuery(e.target.value);
              setSelectedPetId(null);
              setShowPetList(true);
            }}
            onFocus={() => setShowPetList(true)}
            onBlur={() => setTimeout(() => setShowPetList(false), 150)}
          />
          {showPetList && filteredPets.length > 0 && (
            <div className="absolute z-10 left-0 right-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded mt-1 max-h-36 overflow-y-auto">
              {filteredPets.slice(0, 10).map((pet) => (
                <button
                  key={pet.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#2a2a2a] transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setPetQuery(`${pet.name} (${pet.species})`);
                    setShowPetList(false);
                  }}
                >
                  <span className="text-white">{pet.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{pet.species}</span>
                </button>
              ))}
            </div>
          )}
          {selectedPetId && (
            <p className="text-[#FFCC00] text-xs mt-1">Selected</p>
          )}
        </div>

        {/* Notes */}
        <Input
          label="Notes"
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !selectedCageId || !selectedPetId}>
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
