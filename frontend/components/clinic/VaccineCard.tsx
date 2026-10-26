import { Vaccine } from "@/lib/types";

const fmt = (d: string) => {
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

function getStatus(nextDue: string | null): { label: string; cls: string } {
  if (!nextDue) return { label: "No due date", cls: "bg-soft text-muted" };
  const today = new Date().toISOString().split("T")[0];
  const daysLeft = (new Date(nextDue + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000;
  if (daysLeft < 0) return { label: "Overdue", cls: "bg-red-100 text-red-800" };
  if (daysLeft <= 30) return { label: "Due soon", cls: "bg-amber-100 text-amber-800" };
  return { label: "Up to date", cls: "bg-green-100 text-green-800" };
}

export default function VaccineCard({ vaccine }: { vaccine: Vaccine }) {
  const status = getStatus(vaccine.next_due_date);

  return (
    <div className="bg-card border border-line rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-ink font-medium text-sm">{vaccine.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="text-sm text-muted">
        Given: <span className="text-ink">{fmt(vaccine.administered_date.toString())}</span>
      </div>

      {vaccine.next_due_date && (
        <div className="text-sm text-muted">
          Due: <span className="text-ink">{fmt(vaccine.next_due_date.toString())}</span>
        </div>
      )}

      {vaccine.administered_by && (
        <p className="text-sm text-muted">By: {vaccine.administered_by}</p>
      )}

      {vaccine.notes && (
        <p className="text-xs text-muted italic">"{vaccine.notes}"</p>
      )}
    </div>
  );
}
