"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function OwnerModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

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
    <Modal title="Add Owner" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Full Name *"
          placeholder="Ahmad bin Ali"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <Input
          label="Phone *"
          placeholder="+60123456789"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
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
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Add Owner"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
