import { MedicalRecord } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  Emergency: "bg-red-900/60 text-red-300",
  Surgery: "bg-orange-900/60 text-orange-300",
  Treatment: "bg-blue-900/60 text-blue-300",
  Checkup: "bg-green-900/60 text-green-300",
  Grooming: "bg-purple-900/60 text-purple-300",
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
        <div className="w-2 h-2 rounded-full bg-[#FFCC00] flex-shrink-0" />
        <div className="w-px flex-1 bg-[#2a2a2a] mt-1" />
      </div>

      {/* Card */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex-1 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">{fmt(record.visit_date.toString())}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[record.type] ?? "bg-gray-800 text-gray-400"}`}>
            {record.type}
          </span>
        </div>

        {record.diagnosis && (
          <div className="mb-1">
            <span className="text-gray-600 text-xs">Diagnosis: </span>
            <span className="text-white text-sm">{record.diagnosis}</span>
          </div>
        )}
        {record.treatment && (
          <div className="mb-1">
            <span className="text-gray-600 text-xs">Treatment: </span>
            <span className="text-white text-sm">{record.treatment}</span>
          </div>
        )}
        {record.vet_name && (
          <p className="text-gray-500 text-xs mt-1">Dr. {record.vet_name}</p>
        )}
        {record.notes && (
          <p className="text-gray-600 text-xs italic mt-1">"{record.notes}"</p>
        )}
      </div>
    </div>
  );
}
