"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { StaffMember } from "@/lib/types";
import { useToast } from "@/lib/toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface Props {
  staff: StaffMember[];
  myId: number;
}

type Dialog =
  | { kind: "add" }
  | { kind: "password"; member: StaffMember }
  | { kind: "access"; member: StaffMember }
  | null;

export default function StaffManager({ staff, myId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "Staff" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const open = (d: Dialog) => {
    setForm({ name: "", username: "", password: "", role: "Staff" });
    setError("");
    setDialog(d);
  };

  const run = async (action: () => Promise<unknown>, done: string) => {
    setLoading(true);
    setError("");
    try {
      await action();
      setDialog(null);
      showToast(done);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const active = staff.filter((s) => s.is_active);
  const off = staff.filter((s) => !s.is_active);

  const row = (s: StaffMember) => (
    <div key={s.id} className="bg-card border border-line rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-ink font-medium text-sm">
          {s.name} {s.id === myId && <span className="text-muted text-xs font-normal">(you)</span>}
        </div>
        <div className="text-muted text-xs mt-0.5">
          Logs in as <span className="text-ink">{s.username}</span> · {s.role}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => open({ kind: "password", member: s })}>
          New password
        </Button>
        {s.id !== myId && (
          <Button size="sm" variant={s.is_active ? "danger" : "primary"} onClick={() => open({ kind: "access", member: s })}>
            {s.is_active ? "Turn off access" : "Give access back"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-ink text-2xl font-bold">Staff</h1>
        <Button onClick={() => open({ kind: "add" })}>+ Add staff</Button>
      </div>
      <p className="text-muted text-sm mb-6">Everyone gets their own login. When someone leaves, turn off their access.</p>

      <div className="flex flex-col gap-3">{active.map(row)}</div>

      {off.length > 0 && (
        <>
          <h2 className="text-muted text-sm font-medium mt-8 mb-3">No access ({off.length})</h2>
          <div className="flex flex-col gap-3 opacity-60">{off.map(row)}</div>
        </>
      )}

      {dialog?.kind === "add" && (
        <Modal title="Add staff" onClose={() => setDialog(null)}>
          <div className="flex flex-col gap-4">
            <Input label="Name *" placeholder="Aisyah" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Input label="Username (for logging in) *" placeholder="aisyah" value={form.username} onChange={(e) => set("username", e.target.value)} />
            <Input label="Password (at least 8 characters) *" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-ink">What can they do?</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="bg-card border border-line text-ink rounded-lg px-3 py-2.5 text-[15px] focus:outline-none focus:border-brand"
              >
                <option value="Staff">Staff: customers, bookings, clinic</option>
                <option value="Boss">Boss: everything, plus this Staff page</option>
              </select>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={loading}>Cancel</Button>
              <Button
                disabled={loading}
                onClick={() => {
                  if (!form.name.trim() || !form.username.trim() || !form.password) return setError("Name, username and password are required.");
                  run(() => api.post("/staff", form), `${form.name.trim()} can now log in`);
                }}
              >
                {loading ? "Saving..." : "Add staff"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {dialog?.kind === "password" && (
        <Modal title={`New password for ${dialog.member.name}`} onClose={() => setDialog(null)}>
          <div className="flex flex-col gap-4">
            <Input label="New password (at least 8 characters)" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} />
            <p className="text-muted text-xs">Tell {dialog.member.name} the new password yourself.</p>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={loading}>Cancel</Button>
              <Button
                disabled={loading || !form.password}
                onClick={() => run(() => api.put(`/staff/${dialog.member.id}`, { password: form.password }), "Password changed")}
              >
                {loading ? "Saving..." : "Save password"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {dialog?.kind === "access" && (
        <Modal title={dialog.member.is_active ? `Turn off access for ${dialog.member.name}?` : `Give ${dialog.member.name} access again?`} onClose={() => setDialog(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-muted text-sm">
              {dialog.member.is_active
                ? `${dialog.member.name} will be logged out on their next click and can't log in again. Their past work stays.`
                : `${dialog.member.name} can log in again with their old password.`}
            </p>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={loading}>Cancel</Button>
              <Button
                variant={dialog.member.is_active ? "danger" : "primary"}
                disabled={loading}
                onClick={() =>
                  run(
                    () => api.put(`/staff/${dialog.member.id}`, { is_active: !dialog.member.is_active }),
                    dialog.member.is_active ? `${dialog.member.name} can no longer log in` : `${dialog.member.name} can log in again`
                  )
                }
              >
                {loading ? "Saving..." : dialog.member.is_active ? "Turn off access" : "Give access back"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
