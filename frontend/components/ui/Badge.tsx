// Colour means something: red = act now, amber = waiting, green = here / fine, grey = finished
const palettes: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-amber-100 text-amber-800",
  "Checked In": "bg-green-100 text-green-800",
  "Checked Out": "bg-gray-100 text-gray-600",
  Cancelled: "bg-gray-100 text-gray-500 line-through",
};

const words: Record<string, string> = {
  Pending: "Waiting to confirm",
  Confirmed: "Coming",
  "Checked In": "Staying now",
  "Checked Out": "Gone home",
  Cancelled: "Cancelled",
};

export default function Badge({ label }: { label: string }) {
  const style = palettes[label] ?? "bg-soft text-muted";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${style}`}>{words[label] ?? label}</span>
  );
}
