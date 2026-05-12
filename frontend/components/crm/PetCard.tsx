import { Pet } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface Props {
  pet: Pet;
  onClick?: () => void;
}

export default function PetCard({ pet, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 ${onClick ? "cursor-pointer hover:border-[#FFCC00]/40 transition-colors" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">{pet.name}</span>
        <Badge label={pet.species} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {pet.breed && <span className="text-gray-500 text-xs">{pet.breed}</span>}
        {pet.gender && pet.gender !== "Unknown" && <Badge label={pet.gender} />}
        {pet.weight_kg != null && (
          <span className="text-gray-600 text-xs">{pet.weight_kg} kg</span>
        )}
      </div>
    </div>
  );
}
