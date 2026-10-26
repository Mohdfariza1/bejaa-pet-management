import { cookies } from "next/headers";
import { readSession } from "@/lib/session";
import { StaffMember } from "@/lib/types";
import StaffManager from "@/components/staff/StaffManager";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await readSession(cookies().get("session")?.value);
  const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8000"}/staff`, {
    headers: { "x-api-key": process.env.API_KEY ?? "", "x-staff-id": String(session?.id ?? "") },
    cache: "no-store",
  }).catch(() => null);
  const staff: StaffMember[] = res?.ok ? await res.json() : [];

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <StaffManager staff={staff} myId={session?.id ?? 0} />
    </div>
  );
}
