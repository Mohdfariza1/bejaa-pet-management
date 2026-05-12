const palettes: Record<string, string> = {
  Dog: "bg-blue-900/60 text-blue-300",
  Cat: "bg-purple-900/60 text-purple-300",
  Bird: "bg-green-900/60 text-green-300",
  Rabbit: "bg-pink-900/60 text-pink-300",
  Hamster: "bg-orange-900/60 text-orange-300",
  Fish: "bg-cyan-900/60 text-cyan-300",
  Other: "bg-gray-800 text-gray-400",
  Pending: "bg-yellow-900/60 text-yellow-300",
  Confirmed: "bg-blue-900/60 text-blue-300",
  "Checked In": "bg-green-900/60 text-green-300",
  "Checked Out": "bg-gray-800 text-gray-400",
  Cancelled: "bg-red-900/60 text-red-400",
  Male: "bg-blue-900/60 text-blue-300",
  Female: "bg-pink-900/60 text-pink-300",
  Unknown: "bg-gray-800 text-gray-500",
};

export default function Badge({ label }: { label: string }) {
  const style = palettes[label] ?? "bg-gray-800 text-gray-400";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>{label}</span>
  );
}
