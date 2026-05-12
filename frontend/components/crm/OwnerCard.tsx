import { Owner } from "@/lib/types";

interface Props {
  owner: Owner;
  onClick: () => void;
}

export default function OwnerCard({ owner, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#FFCC00]/40 rounded-lg p-4 transition-colors"
    >
      <div className="text-white font-medium text-sm mb-1">{owner.name}</div>
      <div className="text-gray-500 text-xs">{owner.phone}</div>
      {owner.email && (
        <div className="text-gray-600 text-xs mt-0.5 truncate">{owner.email}</div>
      )}
    </button>
  );
}
