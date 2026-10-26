import { Owner } from "@/lib/types";

interface Props {
  owner: Owner;
  onClick: () => void;
}

export default function OwnerCard({ owner, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-card border border-line hover:border-brand rounded-xl p-4 transition-colors"
    >
      <div className="text-ink font-semibold mb-1">{owner.name}</div>
      <div className="text-muted text-sm">{owner.phone}</div>
      {owner.email && (
        <div className="text-muted text-xs mt-0.5 truncate">{owner.email}</div>
      )}
    </button>
  );
}
