"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { Today, TodayStay } from "@/lib/types";

const fmt = (d: string) => {
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

const SPECIES_ICON: Record<string, string> = { Dog: "🐶", Cat: "🐱", Bird: "🐦", Rabbit: "🐰", Hamster: "🐹", Fish: "🐟" };

function waLink(phone: string, text: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "6" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function WhatsApp({ phone, text }: { phone: string; text: string }) {
  return (
    <a
      href={waLink(phone, text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      title="WhatsApp"
      className="h-10 w-10 shrink-0 grid place-items-center rounded-full text-green-600 hover:bg-green-50 transition-colors"
    >
      <Icon name="chat" />
    </a>
  );
}

function Tag({ tone, children }: { tone: "red" | "amber"; children: React.ReactNode }) {
  const cls = tone === "red" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800";
  return <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 max-w-full ${cls}`}>{children}</span>;
}

type TabKey = "attention" | "in" | "out" | "staying";
type Action = { stay: TodayStay; kind: "in" | "out" };

export default function TodayBoard({ today }: { today: Today }) {
  const router = useRouter();
  const { showToast } = useToast();
  const attention = today.late_pickup.length + today.missed_arrival.length + today.vaccines_due.length;
  const [tab, setTab] = useState<TabKey>(attention > 0 ? "attention" : "in");
  const [action, setAction] = useState<Action | null>(null);
  const [ticked, setTicked] = useState(false);
  const [saving, setSaving] = useState(false);

  const tiles: { key: TabKey; label: string; value: string; urgent?: boolean }[] = [
    { key: "attention", label: "Needs attention", value: String(attention), urgent: attention > 0 },
    { key: "in", label: "Coming in", value: String(today.arriving.length) },
    { key: "out", label: "Going home", value: String(today.leaving.length) },
    { key: "staying", label: "Staying now", value: `${today.in_hotel}/${today.cages}` },
  ];

  const open = (stay: TodayStay, kind: Action["kind"]) => { setAction({ stay, kind }); setTicked(false); };

  // A tick is needed before the button works: phone check on the way out, vaccine card when one is overdue
  const needsTick = action !== null && (action.kind === "out" || action.stay.vaccines_overdue.length > 0);

  const confirm = async () => {
    if (!action) return;
    setSaving(true);
    try {
      await api.put(`/bookings/${action.stay.booking_id}`, { status: action.kind === "in" ? "Checked In" : "Checked Out" });
      showToast(action.kind === "in" ? `${action.stay.pet} checked in ✓` : `${action.stay.pet} sent home ✓`);
      setAction(null);
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const row = (key: string, species: string, name: string, tags: React.ReactNode, line: React.ReactNode, right: React.ReactNode) => (
    <li key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-soft text-xl">{SPECIES_ICON[species] ?? "🐾"}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-ink font-semibold">{name}</span>
            {tags}
          </div>
          <p className="text-muted text-sm mt-0.5 sm:truncate">{line}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 pl-14 sm:pl-0">{right}</div>
    </li>
  );

  const stayRow = (stay: TodayStay, kind: Action["kind"] | null, line: React.ReactNode, waText: string) =>
    row(
      `b${stay.booking_id}`,
      stay.species,
      stay.pet,
      <>
        {stay.alert && <Tag tone="red"><Icon name="alert" className="w-3 h-3 shrink-0" />{stay.alert}</Tag>}
        {stay.vaccines_overdue.length > 0 && <Tag tone="amber">Vaccine overdue</Tag>}
      </>,
      line,
      <>
        <WhatsApp phone={stay.phone} text={waText} />
        {kind && <Button size="sm" onClick={() => open(stay, kind)}>{kind === "in" ? "Check in" : "Send home"}</Button>}
      </>,
    );

  const lists: Record<TabKey, React.ReactNode[]> = {
    attention: [
      ...today.late_pickup.map((s) => stayRow(s, "out",
        <><span className="text-red-600 font-medium">Late pickup</span> · was due home {fmt(s.check_out)} · {s.owner}</>,
        `Hi ${s.owner}, ${s.pet} is ready to go home. When can you pick ${s.pet} up?`)),
      ...today.missed_arrival.map((s) => stayRow(s, "in",
        <><span className="text-red-600 font-medium">Not here yet</span> · was coming {fmt(s.check_in)} · {s.owner}</>,
        `Hi ${s.owner}, we were expecting ${s.pet} on ${fmt(s.check_in)}. Are you still coming?`)),
      ...today.vaccines_due.map((v) => row(`v${v.pet_id}`, v.species, v.pet, null,
        <><span className="text-amber-700 font-medium">Vaccine overdue</span> · {v.vaccines.map((x) => x.name).join(", ")} · {v.owner}</>,
        <WhatsApp phone={v.phone} text={`Hi ${v.owner}, ${v.pet}'s ${v.vaccines.map((x) => x.name).join(" and ")} vaccine is overdue. Would you like to book a visit?`} />)),
    ],
    in: today.arriving.map((s) => stayRow(s, "in", <>{s.owner} · {s.cage} · until {fmt(s.check_out)}</>, `Hi ${s.owner}, see you today with ${s.pet}!`)),
    out: today.leaving.map((s) => stayRow(s, "out", <>{s.owner} · {s.cage} · since {fmt(s.check_in)}</>, `Hi ${s.owner}, ${s.pet} is ready to go home today.`)),
    staying: today.staying.map((s) => stayRow(s, null, <>{s.owner} · {s.cage} · home {fmt(s.check_out)}</>, `Hi ${s.owner}, ${s.pet} is doing well with us.`)),
  };

  const empty: Record<TabKey, string> = {
    attention: "All good. Nothing needs attention.",
    in: "Nobody is coming in today.",
    out: "Nobody is going home today.",
    staying: "No pets staying right now.",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-left rounded-2xl p-4 transition-colors border ${
                active ? "bg-card border-brand ring-2 ring-brand/15" : "bg-card/60 border-transparent hover:bg-card"
              }`}
            >
              <div className={`text-3xl font-bold tracking-tight ${t.urgent ? "text-red-600" : "text-ink"}`}>{t.value}</div>
              <div className={`text-sm mt-1 ${active ? "text-ink font-medium" : "text-muted"}`}>{t.label}</div>
            </button>
          );
        })}
      </div>

      <section className="bg-card rounded-2xl border border-line overflow-hidden">
        {lists[tab].length === 0 ? (
          <p className="text-muted px-4 py-10 text-center">{empty[tab]}</p>
        ) : (
          <ul className="divide-y divide-line">{lists[tab]}</ul>
        )}
      </section>

      {action && (
        <Modal title={action.kind === "in" ? `Check in ${action.stay.pet}` : `Send ${action.stay.pet} home`} onClose={() => setAction(null)}>
          <div className="flex flex-col gap-4">
            <div className="text-ink">
              <p><span className="font-semibold">{action.stay.pet}</span> ({action.stay.species}) · cage <span className="font-semibold">{action.stay.cage}</span></p>
              <p className="text-muted text-sm">Owner: {action.stay.owner}</p>
            </div>
            {action.stay.alert && (
              <div className="bg-red-50 text-red-700 text-sm font-medium rounded-lg px-3 py-2">⚠ {action.stay.alert}</div>
            )}
            {action.stay.vaccines_overdue.length > 0 && (
              <div className="bg-amber-50 text-amber-900 text-sm rounded-lg px-3 py-2">Vaccine overdue: {action.stay.vaccines_overdue.join(", ")}</div>
            )}
            {action.kind === "out" && (
              <label className="flex items-start gap-3 bg-soft rounded-lg p-3 cursor-pointer">
                <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} className="mt-1 h-5 w-5 accent-brand" />
                <span className="text-ink text-sm">
                  I asked the person collecting for their phone number and it ends in{" "}
                  <span className="font-bold text-base">{action.stay.phone.slice(-4)}</span>
                </span>
              </label>
            )}
            {action.kind === "in" && action.stay.vaccines_overdue.length > 0 && (
              <label className="flex items-start gap-3 bg-soft rounded-lg p-3 cursor-pointer">
                <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} className="mt-1 h-5 w-5 accent-brand" />
                <span className="text-ink text-sm">I saw a vaccine card showing the vaccine was done, or the boss said OK</span>
              </label>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setAction(null)} disabled={saving}>Back</Button>
              <Button onClick={confirm} disabled={saving || (needsTick && !ticked)}>
                {saving ? "Saving..." : action.kind === "in" ? `Check in ${action.stay.pet}` : `Send ${action.stay.pet} home`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
