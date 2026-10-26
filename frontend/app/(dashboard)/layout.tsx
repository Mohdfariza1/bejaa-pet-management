import { cookies } from "next/headers";
import Sidebar from "@/components/ui/Sidebar";
import { ToastProvider } from "@/lib/toast";
import { readSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession(cookies().get("session")?.value);
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-page">
        <Sidebar name={session?.name ?? ""} role={session?.role ?? "Staff"} />
        <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
      </div>
    </ToastProvider>
  );
}
