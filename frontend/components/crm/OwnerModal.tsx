"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Owner } from "@/lib/types";

interface Props {
  onClose: () => void;
  onCreated: () => void;
  onOpenExisting: (owner: Owner) => void;
}

export default function OwnerModal({ onClose, onCreated, onOpenExisting }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [existing, setExisting] = useState<Owner | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Checked when staff leave the phone box, so a returning customer is caught before anything is typed twice
  const checkPhone = async () => {
    if (form.phone.replace(/\D/g, "").length < 8) return;
    try {
      setExisting(await api.get<Owner | null>(`/owners/check-phone?phone=${encodeURIComponent(form.phone)}`));
    } catch {
      setExisting(null);
    }
  };

  const openExisting = async () => {
    if (!existing) return;
    try {
      onOpenExisting(existing.archived_at ? await api.post<Owner>(`/owners/${existing.id}/restore`, {}) : existing);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/owners", {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add customer" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Phone *"
          placeholder="012-345 6789"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => { set("phone", e.target.value); setExisting(null); }}
          onBlur={checkPhone}
        />
        {existing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 flex items-center justify-between gap-3">
            <p className="text-amber-900 text-sm">
              Already a customer: <span className="font-semibold">{existing.name}</span>
              {existing.archived_at && " (archived)"}
            </p>
            <Button size="sm" variant="secondary" onClick={openExisting}>
              {existing.archived_at ? "Bring back" : "Open"}
            </Button>
          </div>
        )}
        <Input
          label="Full name *"
          placeholder="Ahmad bin Ali"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="ahmad@email.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Input
          label="Address"
          placeholder="No 12, Jalan..."
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading || existing !== null}>
            {loading ? "Saving..." : "Add customer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
