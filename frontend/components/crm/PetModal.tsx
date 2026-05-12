"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Props {
  ownerId: number;
  onClose: () => void;
  onCreated: () => void;
}

const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Fish", "Other"];
const GENDERS = ["Male", "Female", "Unknown"];

const selectCls =
  "bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FFCC00] transition-colors";

export default function PetModal({ ownerId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "", species: "Dog", breed: "", gender: "Unknown", weight_kg: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Pet name is required."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/pets", {
        owner_id: ownerId,
        name: form.name,
        species: form.species,
        breed: form.breed || null,
        gender: form.gender,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Pet" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Pet Name *"
          placeholder="Fluffy"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Species *</label>
          <select className={selectCls} value={form.species} onChange={(e) => set("species", e.target.value)}>
            {SPECIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <Input
          label="Breed"
          placeholder="Golden Retriever"
          value={form.breed}
          onChange={(e) => set("breed", e.target.value)}
        />
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-400">Gender</label>
            <select className={selectCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="4.5"
              min="0"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => set("weight_kg", e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Add Pet"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
