"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Props {
  petId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function VaccineModal({ petId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    administered_date: new Date().toISOString().split("T")[0],
    next_due_date: "",
    administered_by: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Vaccine name is required."); return; }
    if (!form.administered_date) { setError("Administered date is required."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/vaccines", {
        pet_id: petId,
        name: form.name.trim(),
        administered_date: form.administered_date,
        next_due_date: form.next_due_date || null,
        administered_by: form.administered_by || null,
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
    <Modal title="Add Vaccine" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Vaccine Name *"
          placeholder="e.g. Rabies, DHPP, Bordetella"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Administered Date *"
            type="date"
            value={form.administered_date}
            onChange={(e) => set("administered_date", e.target.value)}
          />
          <Input
            label="Next Due Date"
            type="date"
            value={form.next_due_date}
            onChange={(e) => set("next_due_date", e.target.value)}
          />
        </div>

        <Input
          label="Administered By"
          placeholder="Dr. Siti"
          value={form.administered_by}
          onChange={(e) => set("administered_by", e.target.value)}
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
            {loading ? "Saving..." : "Save Vaccine"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
