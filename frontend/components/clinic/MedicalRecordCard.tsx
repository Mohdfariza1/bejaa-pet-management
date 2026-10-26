import { MedicalRecord } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  Emergency: "bg-red-100 text-red-800",
  Surgery: "bg-red-100 text-red-800",
};

const fmt = (d: string) => {
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

export default function MedicalRecordCard({ record }: { record: MedicalRecord }) {
  return (
    <div className="flex gap-4">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
        <div className="w-px flex-1 bg-soft mt-1" />
      </div>

      {/* Card */}
      <div className="bg-card border border-line rounded-lg p-4 flex-1 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-xs">{fmt(record.visit_date.toString())}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_STYLES[record.type] ?? "bg-soft text-ink"}`}>
            {record.type}
          </span>
        </div>

        {record.diagnosis && (
          <div className="mb-1">
            <span className="text-muted text-xs">Diagnosis: </span>
            <span className="text-ink text-sm">{record.diagnosis}</span>
          </div>
        )}
        {record.treatment && (
          <div className="mb-1">
            <span className="text-muted text-xs">Treatment: </span>
            <span className="text-ink text-sm">{record.treatment}</span>
          </div>
        )}
        {record.vet_name && (
          <p className="text-muted text-xs mt-1">Dr. {record.vet_name}</p>
        )}
        {record.notes && (
          <p className="text-muted text-xs italic mt-1">"{record.notes}"</p>
        )}
      </div>
    </div>
  );
}
