"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Pet, MedicalRecord, Vaccine } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MedicalRecordCard from "@/components/clinic/MedicalRecordCard";
import VaccineCard from "@/components/clinic/VaccineCard";
import MedicalModal from "@/components/clinic/MedicalModal";
import VaccineModal from "@/components/clinic/VaccineModal";
import { useToast } from "@/lib/toast";

type ClinicTab = "medical" | "vaccines";

export default function ClinicPage() {
  const { showToast } = useToast();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [petQuery, setPetQuery] = useState("");
  const [showPetList, setShowPetList] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [tab, setTab] = useState<ClinicTab>("medical");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [showMedModal, setShowMedModal] = useState(false);
  const [showVaxModal, setShowVaxModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Pet[]>("/pets").then(setAllPets).catch(() => {});
  }, []);

  const filteredPets = petQuery
    ? allPets.filter((p) => p.name.toLowerCase().includes(petQuery.toLowerCase()))
    : allPets.slice(0, 8);

  const selectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    setPetQuery(pet.name);
    setShowPetList(false);
    setLoading(true);
    try {
      const [recs, vaxs] = await Promise.all([
        api.get<MedicalRecord[]>(`/medical/${pet.id}`),
        api.get<Vaccine[]>(`/vaccines/${pet.id}`),
      ]);
      setRecords(recs);
      setVaccines(vaxs);
    } catch {
      setRecords([]);
      setVaccines([]);
      showToast("Failed to load records for this pet", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshRecords = async () => {
    if (!selectedPet) return;
    try {
      const data = await api.get<MedicalRecord[]>(`/medical/${selectedPet.id}`);
      setRecords(data);
    } catch { /* silent */ }
  };

  const refreshVaccines = async () => {
    if (!selectedPet) return;
    try {
      const data = await api.get<Vaccine[]>(`/vaccines/${selectedPet.id}`);
      setVaccines(data);
    } catch { /* silent */ }
  };

  const handleBack = () => {
    setSelectedPet(null);
    setPetQuery("");
    setRecords([]);
    setVaccines([]);
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-semibold">
          {selectedPet ? (
            <span className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-[#FFCC00] text-sm font-normal transition-colors"
              >
                ← Clinic
              </button>
              <span className="text-[#FFCC00]">{selectedPet.name}</span>
              <span className="text-gray-600 text-sm font-normal">
                {selectedPet.species}{selectedPet.breed ? ` · ${selectedPet.breed}` : ""}
              </span>
            </span>
          ) : (
            "Clinic"
          )}
        </h1>
        {selectedPet && tab === "medical" && (
          <Button size="sm" onClick={() => setShowMedModal(true)}>+ Add Record</Button>
        )}
        {selectedPet && tab === "vaccines" && (
          <Button size="sm" onClick={() => setShowVaxModal(true)}>+ Add Vaccine</Button>
        )}
      </div>

      {/* Pet search */}
      {!selectedPet && (
        <div className="relative mb-4">
          <Input
            placeholder="Search pet by name..."
            value={petQuery}
            onChange={(e) => { setPetQuery(e.target.value); setShowPetList(true); }}
            onFocus={() => setShowPetList(true)}
            onBlur={() => setTimeout(() => setShowPetList(false), 150)}
          />
          {showPetList && filteredPets.length > 0 && (
            <div className="absolute z-10 left-0 right-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded mt-1 max-h-52 overflow-y-auto">
              {filteredPets.map((pet) => (
                <button
                  key={pet.id}
                  className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPet(pet)}
                >
                  <p className="text-white text-sm">{pet.name}</p>
                  <p className="text-gray-500 text-xs">
                    {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
          {!petQuery && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-sm">Search a pet to view clinic records.</p>
            </div>
          )}
          {petQuery && filteredPets.length === 0 && (
            <p className="text-gray-600 text-xs mt-2">No pets found.</p>
          )}
        </div>
      )}

      {/* Tabs + content */}
      {selectedPet && (
        <>
          <div className="flex border-b border-[#2a2a2a] mb-6">
            {(["medical", "vaccines"] as ClinicTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#FFCC00] text-[#FFCC00]"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "medical" ? "Medical Records" : "Vaccines"}
                <span className="ml-1.5 text-xs text-gray-600">
                  ({t === "medical" ? records.length : vaccines.length})
                </span>
              </button>
            ))}
          </div>

          {loading && <p className="text-gray-600 text-sm">Loading...</p>}

          {!loading && tab === "medical" && (
            records.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-sm">No medical records yet.</p>
                <button
                  onClick={() => setShowMedModal(true)}
                  className="text-[#FFCC00] text-sm mt-2 hover:underline"
                >
                  Add first record →
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {records.map((r) => (
                  <MedicalRecordCard key={r.id} record={r} />
                ))}
              </div>
            )
          )}

          {!loading && tab === "vaccines" && (
            vaccines.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-sm">No vaccines recorded yet.</p>
                <button
                  onClick={() => setShowVaxModal(true)}
                  className="text-[#FFCC00] text-sm mt-2 hover:underline"
                >
                  Add first vaccine →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vaccines.map((v) => (
                  <VaccineCard key={v.id} vaccine={v} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {showMedModal && selectedPet && (
        <MedicalModal
          petId={selectedPet.id}
          onClose={() => setShowMedModal(false)}
          onCreated={() => { setShowMedModal(false); refreshRecords(); }}
        />
      )}
      {showVaxModal && selectedPet && (
        <VaccineModal
          petId={selectedPet.id}
          onClose={() => setShowVaxModal(false)}
          onCreated={() => { setShowVaxModal(false); refreshVaccines(); }}
        />
      )}
    </div>
  );
}
