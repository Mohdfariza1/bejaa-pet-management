import { cookies } from "next/headers";
import { readSession } from "@/lib/session";
import { Today } from "@/lib/types";
import TodayBoard from "@/components/today/TodayBoard";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await readSession(cookies().get("session")?.value);
  const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8000"}/today`, {
    headers: { "x-api-key": process.env.API_KEY ?? "", "x-staff-id": String(session?.id ?? "") },
    cache: "no-store",
  }).catch(() => null);
  const today: Today | null = res?.ok ? await res.json() : null;

  const now = new Date();
  const hour = Number(now.toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", hour12: false }));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-MY", { timeZone: "Asia/Kuala_Lumpur", weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-ink text-2xl font-bold">{greeting}, {session?.name.split(" ")[0]}</h1>
        <p className="text-muted mt-1">{dateLabel}</p>
      </div>
      {today ? (
        <TodayBoard today={today} />
      ) : (
        <div className="bg-card border border-line rounded-xl p-6 text-ink">
          The system is starting up. Please refresh the page in a minute.
        </div>
      )}
    </div>
  );
}
