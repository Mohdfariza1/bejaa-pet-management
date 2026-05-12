type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variants: Record<Variant, string> = {
  primary: "bg-[#FFCC00] text-black hover:bg-yellow-300",
  secondary: "bg-[#2a2a2a] text-white hover:bg-[#333] border border-[#3a3a3a]",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-400 hover:text-white hover:bg-[#1a1a1a]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
