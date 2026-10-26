"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Owner, Pet } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OwnerCard from "@/components/crm/OwnerCard";
import PetCard from "@/components/crm/PetCard";
import OwnerModal from "@/components/crm/OwnerModal";
import PetModal from "@/components/crm/PetModal";

export default function CRMPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [query, setQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadOwners = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await api.get<Owner[]>(`/owners${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setOwners(data);
    } catch {
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPets = useCallback(async (ownerId: number) => {
    try {
      const data = await api.get<Pet[]>(`/pets?owner_id=${ownerId}`);
      setPets(data);
    } catch {
      setPets([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadOwners(query), 300);
    return () => clearTimeout(t);
  }, [query, loadOwners]);

  const handleOwnerClick = (owner: Owner) => {
    setSelectedOwner(owner);
    loadPets(owner.id);
  };

  const handleBack = () => {
    setSelectedOwner(null);
    setPets([]);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ink text-2xl font-bold">
          {selectedOwner ? (
            <span className="flex items-center gap-3">
              <button onClick={handleBack} className="text-muted hover:text-brand text-sm font-normal transition-colors">
                ← Customers
              </button>
              <span>{selectedOwner.name}</span>
              <span className="text-muted text-sm font-normal">{selectedOwner.phone}</span>
            </span>
          ) : (
            "Customers"
          )}
        </h1>
        {selectedOwner ? (
          <Button size="sm" onClick={() => setShowPetModal(true)}>+ Add pet</Button>
        ) : (
          <Button onClick={() => setShowOwnerModal(true)}>+ Add customer</Button>
        )}
      </div>

      {/* Search (owners view only) */}
      {!selectedOwner && (
        <Input
          placeholder="Search by name or phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full mb-6"
        />
      )}

      {/* Owner list */}
      {!selectedOwner && (
        <>
          {loading && (
            <p className="text-muted text-sm">Loading...</p>
          )}
          {!loading && owners.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted text-sm">No customers found.</p>
              <button
                onClick={() => setShowOwnerModal(true)}
                className="text-brand text-sm mt-2 hover:underline"
              >
                Add a customer →
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {owners.map((owner) => (
              <OwnerCard key={owner.id} owner={owner} onClick={() => handleOwnerClick(owner)} />
            ))}
          </div>
        </>
      )}

      {/* Pet list for selected owner */}
      {selectedOwner && (
        <>
          {pets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted text-sm">No pets registered yet.</p>
              <button
                onClick={() => setShowPetModal(true)}
                className="text-brand text-sm mt-2 hover:underline"
              >
                Add a pet →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showOwnerModal && (
        <OwnerModal
          onClose={() => setShowOwnerModal(false)}
          onCreated={() => { setShowOwnerModal(false); loadOwners(query); }}
          onOpenExisting={(owner) => { setShowOwnerModal(false); handleOwnerClick(owner); }}
        />
      )}
      {showPetModal && selectedOwner && (
        <PetModal
          ownerId={selectedOwner.id}
          onClose={() => setShowPetModal(false)}
          onCreated={() => { setShowPetModal(false); loadPets(selectedOwner.id); }}
        />
      )}
    </div>
  );
}
