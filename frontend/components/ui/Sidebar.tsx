"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/crm", label: "CRM", icon: "◎" },
  { href: "/hotel", label: "Hotel", icon: "▦" },
  { href: "/clinic", label: "Clinic", icon: "✚" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 min-h-screen bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-[#1e1e1e]">
        <div className="text-[#FFCC00] font-bold text-sm tracking-widest uppercase">Bejaa Pet</div>
        <div className="text-gray-700 text-xs mt-0.5">Management System</div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? "bg-[#FFCC00]/10 text-[#FFCC00] font-medium"
                  : "text-gray-500 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#1e1e1e] text-xs text-gray-700">v1.0.0</div>
    </aside>
  );
}
