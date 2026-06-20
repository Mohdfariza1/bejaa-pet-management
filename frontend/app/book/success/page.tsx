import Link from "next/link"

export const metadata = {
  title: "Booking Confirmed — Bejaa Pet Hotel",
}

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  const ref = searchParams.ref ?? "—"

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <span className="text-6xl block mb-6">🎉</span>
        <h1 className="text-3xl font-bold text-[#111] mb-3">Booking Confirmed!</h1>
        <p className="text-gray-500 text-sm mb-3">Your booking reference number:</p>
        <div className="bg-[#FFCC00] text-[#111] font-mono font-bold text-2xl px-8 py-4 rounded-2xl inline-block mb-8">
          #{ref}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left mb-8 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">📲</span>
            <p className="text-sm text-gray-600">
              Our team will contact you via <span className="font-semibold text-[#111]">WhatsApp</span> to confirm your booking details shortly.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">🕐</span>
            <p className="text-sm text-gray-600">
              Please arrive <span className="font-semibold text-[#111]">15 minutes before</span> your check-in time so we can settle your pet comfortably.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">📋</span>
            <p className="text-sm text-gray-600">
              Bring any <span className="font-semibold text-[#111]">vaccination records</span> if available — it helps our clinic team.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 border border-gray-200 text-[#111] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Back to Home
          </Link>
          <Link
            href="/book"
            className="flex-1 bg-[#FFCC00] text-[#111] font-bold text-sm px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors text-center"
          >
            Book Another Stay
          </Link>
        </div>
      </div>

      <p className="text-gray-300 text-xs mt-16">© 2026 Bejaa Pet Hotel & Clinic</p>
    </div>
  )
}
