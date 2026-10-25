"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/crm", label: "CRM", icon: "◎" },
  { href: "/hotel", label: "Hotel", icon: "▦" },
  { href: "/clinic", label: "Clinic", icon: "✚" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0d0d0d] border-b border-[#1e1e1e] flex items-center justify-between px-4">
        <div>
          <span className="text-[#FFCC00] font-bold text-sm tracking-widest uppercase">Bejaa Pet</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="text-gray-400 hover:text-white text-xl leading-none px-2 py-1"
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        className={`w-52 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:static md:translate-x-0 md:min-h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-6 border-b border-[#1e1e1e] flex items-center justify-between">
          <div>
            <div className="text-[#FFCC00] font-bold text-sm tracking-widest uppercase">Bejaa Pet</div>
            <div className="text-gray-700 text-xs mt-0.5">Management System</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
            className="md:hidden text-gray-500 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
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

        <div className="px-3 py-4 border-t border-[#1e1e1e] flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-gray-500 hover:text-red-400 hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="text-base leading-none">⎋</span>
            Logout
          </button>
          <div className="text-xs text-gray-700 px-3">v1.0.0</div>
        </div>
      </aside>
    </>
  );
}
