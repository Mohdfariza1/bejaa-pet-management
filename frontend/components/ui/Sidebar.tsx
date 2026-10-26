"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/ui/Icon";

const nav = [
  { href: "/dashboard", label: "Today", icon: "today" },
  { href: "/crm", label: "Customers", icon: "customers" },
  { href: "/hotel", label: "Boarding", icon: "boarding" },
  { href: "/clinic", label: "Clinic", icon: "clinic" },
] as const;

export default function Sidebar({ name, role }: { name: string; role: "Boss" | "Staff" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const links = role === "Boss" ? [...nav, { href: "/staff", label: "Staff", icon: "staff" } as const] : nav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-line flex items-center justify-between px-4">
        <div>
          <span className="flex items-center gap-2 text-ink font-bold"><span className="h-7 w-7 grid place-items-center rounded-lg bg-brand text-white text-sm font-bold">B</span>Bejaa Pet</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="text-ink text-2xl leading-none px-2 py-1"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={`w-56 bg-card border-r border-line flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:static md:translate-x-0 md:min-h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 grid place-items-center rounded-xl bg-brand text-white text-lg font-bold">B</span>
              <div>
                <div className="text-ink font-bold leading-tight">Bejaa Pet</div>
                <div className="text-muted text-xs">Hotel &amp; Clinic</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
            className="md:hidden text-muted hover:text-ink text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] transition-colors ${
                  active
                    ? "bg-brand-soft text-brand font-semibold"
                    : "text-muted hover:text-ink hover:bg-soft"
                }`}
              >
                <Icon name={icon} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-line flex flex-col gap-2">
          {name && (
            <div className="px-3">
              <div className="text-ink text-sm font-semibold truncate">{name}</div>
              <div className="text-muted text-xs">{role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-red-600 hover:bg-soft transition-colors"
          >
            <Icon name="logout" />
            Log out
          </button>
          <div className="text-xs text-muted px-3">v1.1.0</div>
        </div>
      </aside>
    </>
  );
}
