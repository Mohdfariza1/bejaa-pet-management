"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormData = {
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  ownerAddress: string
  petName: string
  petSpecies: string
  petBreed: string
  petGender: string
  petDob: string
  petWeight: string
  checkIn: string
  checkOut: string
  cageId: number | null
}

type Cage = { id: number; label: string; type: string; size: string }
type Owner = { id: number; phone: string }
type Pet = { id: number }
type Booking = { id: number }

const SPECIES = ["Cat", "Dog", "Bird", "Rabbit", "Hamster", "Fish", "Other"]
const GENDERS = ["Unknown", "Male", "Female"]
const STEP_LABELS = ["Your Info", "Your Pet", "Dates & Room", "Confirm"]

const today = new Date().toISOString().split("T")[0]

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(err.detail ?? "Request failed")
  }
  return res.json()
}

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    ownerName: "", ownerPhone: "", ownerEmail: "", ownerAddress: "",
    petName: "", petSpecies: "Cat", petBreed: "", petGender: "Unknown",
    petDob: "", petWeight: "",
    checkIn: "", checkOut: "", cageId: null,
  })
  const [cages, setCages] = useState<Cage[]>([])
  const [cagesFetched, setCagesFetched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof FormData, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const goNext = (to: number) => { setError(null); setStep(to) }
  const goBack = (to: number) => { setError(null); setStep(to) }

  const fetchCages = async () => {
    if (!form.checkIn || !form.checkOut) { setError("Please select both check-in and check-out dates."); return }
    if (form.checkOut <= form.checkIn) { setError("Check-out must be after check-in."); return }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Cage[]>("GET", `/cages/available?check_in=${form.checkIn}&check_out=${form.checkOut}`)
      setCages(data)
      setCagesFetched(true)
      set("cageId", null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch cages")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      let ownerId: number
      try {
        const owner = await apiFetch<Owner>("POST", "/owners", {
          name: form.ownerName,
          phone: form.ownerPhone,
          email: form.ownerEmail || null,
          address: form.ownerAddress || null,
        })
        ownerId = owner.id
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : ""
        if (msg.toLowerCase().includes("already registered") || msg.includes("409")) {
          const owners = await apiFetch<Owner[]>("GET", `/owners?q=${encodeURIComponent(form.ownerPhone)}`)
          const match = owners.find(o => o.phone === form.ownerPhone)
          if (!match) throw new Error("Phone already registered but lookup failed. Please contact us directly.")
          ownerId = match.id
        } else {
          throw e
        }
      }

      const pet = await apiFetch<Pet>("POST", "/pets", {
        owner_id: ownerId,
        name: form.petName,
        species: form.petSpecies,
        breed: form.petBreed || null,
        gender: form.petGender,
        date_of_birth: form.petDob || null,
        weight_kg: form.petWeight ? parseFloat(form.petWeight) : null,
      })

      const booking = await apiFetch<Booking>("POST", "/bookings", {
        pet_id: pet.id,
        cage_id: form.cageId,
        check_in: form.checkIn,
        check_out: form.checkOut,
      })

      router.push(`/book/success?ref=${booking.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.")
      setLoading(false)
    }
  }

  const selectedCage = cages.find(c => c.id === form.cageId)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[#111] text-sm hover:text-gray-600 transition-colors">
            ← Bejaa Pet Hotel
          </Link>
          <span className="text-xs text-gray-400">Step {step} of 4</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full mb-2 transition-colors duration-300 ${i + 1 <= step ? "bg-[#FFCC00]" : "bg-gray-200"}`} />
              <p className={`text-xs text-center hidden sm:block ${i + 1 === step ? "text-[#111] font-medium" : "text-gray-400"}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* ── Step 1: Owner Info ── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] mb-1">Your Information</h1>
            <p className="text-gray-500 text-sm mb-8">We'll use this to confirm your booking via WhatsApp.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00]"
                  placeholder="Ahmad bin Abdullah"
                  value={form.ownerName}
                  onChange={e => set("ownerName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00]"
                  placeholder="0123456789"
                  value={form.ownerPhone}
                  onChange={e => set("ownerPhone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00]"
                  placeholder="email@example.com"
                  value={form.ownerEmail}
                  onChange={e => set("ownerEmail", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] resize-none"
                  rows={2}
                  placeholder="No. 1, Jalan Ampang..."
                  value={form.ownerAddress}
                  onChange={e => set("ownerAddress", e.target.value)}
                />
              </div>
            </div>
            <button
              className="mt-8 w-full bg-[#FFCC00] text-[#111] font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors"
              onClick={() => {
                if (!form.ownerName.trim()) { setError("Name is required."); return }
                if (!form.ownerPhone.trim()) { setError("WhatsApp number is required."); return }
                goNext(2)
              }}
            >
              Next — Pet Info →
            </button>
          </div>
        )}

        {/* ── Step 2: Pet Info ── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] mb-1">About Your Pet</h1>
            <p className="text-gray-500 text-sm mb-8">Tell us a bit about your furry friend.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Pet Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00]"
                  placeholder="Mochi"
                  value={form.petName}
                  onChange={e => set("petName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">
                    Species <span className="text-red-400">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                    value={form.petSpecies}
                    onChange={e => set("petSpecies", e.target.value)}
                  >
                    {SPECIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Gender</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                    value={form.petGender}
                    onChange={e => set("petGender", e.target.value)}
                  >
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Breed <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00]"
                  placeholder="Persian, Labrador, etc."
                  value={form.petBreed}
                  onChange={e => set("petBreed", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">
                    Date of Birth <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                    value={form.petDob}
                    max={today}
                    onChange={e => set("petDob", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">
                    Weight (kg) <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                    placeholder="3.5"
                    value={form.petWeight}
                    onChange={e => set("petWeight", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 border border-gray-200 text-[#111] font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                onClick={() => goBack(1)}
              >
                ← Back
              </button>
              <button
                className="flex-[2] bg-[#FFCC00] text-[#111] font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors"
                onClick={() => {
                  if (!form.petName.trim()) { setError("Pet name is required."); return }
                  goNext(3)
                }}
              >
                Next — Pick Dates →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Dates & Cage ── */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] mb-1">Dates & Room</h1>
            <p className="text-gray-500 text-sm mb-8">Select your stay period and pick an available room.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Check-in <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                  value={form.checkIn}
                  min={today}
                  onChange={e => { set("checkIn", e.target.value); setCagesFetched(false); set("cageId", null) }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Check-out <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FFCC00]"
                  value={form.checkOut}
                  min={form.checkIn || today}
                  onChange={e => { set("checkOut", e.target.value); setCagesFetched(false); set("cageId", null) }}
                />
              </div>
            </div>

            <button
              className="w-full border border-[#FFCC00] text-[#111] font-semibold py-3 rounded-xl text-sm hover:bg-yellow-50 transition-colors mb-6 disabled:opacity-50"
              onClick={fetchCages}
              disabled={loading}
            >
              {loading ? "Searching..." : "Find Available Rooms"}
            </button>

            {cagesFetched && (
              <div>
                {cages.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-sm">No rooms available for these dates.</p>
                    <p className="text-gray-400 text-xs mt-1">Try different dates.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">
                      {cages.length} room{cages.length !== 1 ? "s" : ""} available — select one:
                    </p>
                    <div className="space-y-2">
                      {cages.map(c => (
                        <button
                          key={c.id}
                          onClick={() => set("cageId", c.id)}
                          className={`w-full text-left border rounded-xl px-5 py-4 transition-all ${
                            form.cageId === c.id
                              ? "border-[#FFCC00] bg-yellow-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-[#111] text-sm">Room {c.label}</span>
                              <span className="ml-3 text-xs text-gray-400">{c.type} · {c.size}</span>
                            </div>
                            {form.cageId === c.id && (
                              <span className="text-xs font-bold bg-[#FFCC00] text-[#111] px-2.5 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 border border-gray-200 text-[#111] font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                onClick={() => goBack(2)}
              >
                ← Back
              </button>
              <button
                className="flex-[2] bg-[#FFCC00] text-[#111] font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!form.cageId}
                onClick={() => goNext(4)}
              >
                Next — Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] mb-1">Confirm Booking</h1>
            <p className="text-gray-500 text-sm mb-8">Review your details before submitting.</p>

            <div className="space-y-3">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Owner</p>
                <p className="font-semibold text-[#111]">{form.ownerName}</p>
                <p className="text-sm text-gray-500">{form.ownerPhone}</p>
                {form.ownerEmail && <p className="text-sm text-gray-500">{form.ownerEmail}</p>}
                {form.ownerAddress && <p className="text-sm text-gray-500 mt-1">{form.ownerAddress}</p>}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Pet</p>
                <p className="font-semibold text-[#111]">{form.petName}</p>
                <p className="text-sm text-gray-500">
                  {form.petSpecies} · {form.petGender}
                  {form.petBreed ? ` · ${form.petBreed}` : ""}
                </p>
                {form.petWeight && <p className="text-sm text-gray-500">{form.petWeight} kg</p>}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Stay</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-gray-400">Check-in</p>
                    <p className="font-semibold text-[#111] text-sm">{form.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Check-out</p>
                    <p className="font-semibold text-[#111] text-sm">{form.checkOut}</p>
                  </div>
                </div>
              </div>

              {selectedCage && (
                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Room</p>
                  <p className="font-semibold text-[#111]">Room {selectedCage.label}</p>
                  <p className="text-sm text-gray-500">{selectedCage.type} · {selectedCage.size}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 border border-gray-200 text-[#111] font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                onClick={() => goBack(3)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                className="flex-[2] bg-[#FFCC00] text-[#111] font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm Booking ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
