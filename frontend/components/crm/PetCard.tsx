import { Pet } from "@/lib/types";

interface Props {
  pet: Pet;
  onClick?: () => void;
}

export default function PetCard({ pet, onClick }: Props) {
  const details = [pet.species, pet.breed, pet.gender !== "Unknown" ? pet.gender : null, pet.weight_kg != null ? `${pet.weight_kg} kg` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-line rounded-xl p-4 ${onClick ? "cursor-pointer hover:border-brand transition-colors" : ""}`}
    >
      <div className="text-ink font-semibold">{pet.name}</div>
      <div className="text-muted text-sm mt-0.5">{details}</div>
      {pet.alert && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg px-3 py-2">
          ⚠ {pet.alert}
        </div>
      )}
    </div>
  );
}
