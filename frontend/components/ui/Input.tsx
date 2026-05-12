interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-gray-400">{label}</label>}
      <input
        className={`bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#FFCC00] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
