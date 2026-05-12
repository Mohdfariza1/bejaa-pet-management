"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

const VISIT_TYPES = ["Checkup", "Treatment", "Surgery", "Grooming", "Emergency"];

interface Props {
  petId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function MedicalModal({ petId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    type: "Checkup",
    diagnosis: "",
    treatment: "",
    vet_name: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.visit_date) { setError("Visit date is required."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/medical", {
        pet_id: petId,
        visit_date: form.visit_date,
        type: form.type,
        diagnosis: form.diagnosis || null,
        treatment: form.treatment || null,
        vet_name: form.vet_name || null,
        notes: form.notes || null,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Medical Record" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Visit Date *"
            type="date"
            value={form.visit_date}
            onChange={(e) => set("visit_date", e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Type *</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FFCC00] transition-colors"
            >
              {VISIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Diagnosis"
          placeholder="e.g. Ear infection"
          value={form.diagnosis}
          onChange={(e) => set("diagnosis", e.target.value)}
        />
        <Input
          label="Treatment"
          placeholder="e.g. Antibiotics 5 days"
          value={form.treatment}
          onChange={(e) => set("treatment", e.target.value)}
        />
        <Input
          label="Vet Name"
          placeholder="Dr. Ahmad"
          value={form.vet_name}
          onChange={(e) => set("vet_name", e.target.value)}
        />
        <Input
          label="Notes"
          placeholder="Optional notes..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Save Record"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
