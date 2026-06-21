import Link from "next/link"

export const metadata = {
  title: "Bejaa Pet Hotel & Clinic — Premium Pet Boarding",
  description: "Safe, clean, and monitored 24/7 pet boarding. Book your pet's stay online in minutes.",
}

const services = [
  {
    icon: "🏠",
    title: "Pet Hotel",
    desc: "Cozy, climate-controlled rooms for your pet. Standard, Premium, and VIP suites available.",
  },
  {
    icon: "🩺",
    title: "Veterinary Clinic",
    desc: "On-site vet for health checks, medical records, and vaccine tracking.",
  },
  {
    icon: "📲",
    title: "WhatsApp Updates",
    desc: "Automated check-in, check-out, and vaccine reminders sent directly to your phone.",
  },
]

const steps = [
  { step: "1", title: "Fill in the Form", desc: "Your details + pet info in under 2 minutes." },
  { step: "2", title: "Pick Your Dates", desc: "Choose check-in, check-out, and available room." },
  { step: "3", title: "We Handle the Rest", desc: "Confirmation via WhatsApp. We'll see you on arrival." },
]

const pricing = [
  {
    type: "Standard",
    size: "Small–Medium",
    price: "RM 30",
    perks: ["Daily feeding", "Basic monitoring", "WhatsApp updates"],
  },
  {
    type: "Premium",
    size: "Medium–Large",
    price: "RM 50",
    perks: ["Priority care", "Playtime session", "Daily photos"],
    highlight: true,
  },
  {
    type: "VIP",
    size: "All sizes",
    price: "RM 80",
    perks: ["Private suite", "Grooming included", "Vet check on arrival"],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-lg tracking-tight">Bejaa Pet Hotel</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#services" className="hover:text-[#111] transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-[#111] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#111] transition-colors">Pricing</a>
            <Link href="/dashboard" className="text-gray-300 hover:text-gray-500 transition-colors text-xs">Staff Login</Link>
          </div>
          <Link
            href="/book"
            className="bg-[#FFCC00] text-[#111] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Book a Stay
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#111111] text-white py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-5xl block mb-6">🐾</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Your Pet's Home<br />Away From Home
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Premium boarding for cats and dogs — safe, clean, and monitored 24/7.
            Clinic care available on-site. Book in minutes.
          </p>
          <Link
            href="/book"
            className="inline-block bg-[#FFCC00] text-[#111] font-bold text-base px-10 py-4 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Book a Stay Now
          </Link>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What We Offer</h2>
          <p className="text-gray-500 text-center mb-14">Everything your pet needs under one roof.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <span className="text-4xl block mb-4">{s.icon}</span>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-500 mb-14">3 simple steps to book your pet's stay.</p>
          <div className="flex flex-col md:flex-row gap-6">
            {steps.map((item) => (
              <div key={item.step} className="flex-1 bg-white rounded-2xl p-8 border border-gray-100">
                <div className="w-10 h-10 bg-[#FFCC00] rounded-full flex items-center justify-center font-bold text-[#111] text-lg mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Room Types</h2>
          <p className="text-gray-500 text-center mb-14">All rooms are cleaned daily and air-conditioned.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div
                key={p.type}
                className={`rounded-2xl p-8 border ${p.highlight ? "border-[#FFCC00] shadow-lg" : "border-gray-100"}`}
              >
                {p.highlight && (
                  <div className="text-xs font-bold text-[#111] bg-[#FFCC00] px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-lg mb-1">{p.type}</h3>
                <p className="text-gray-400 text-xs mb-4">{p.size} pets</p>
                <div className="text-3xl font-bold mb-1">{p.price}</div>
                <p className="text-gray-400 text-xs mb-6">per night</p>
                <ul className="space-y-2">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-[#FFCC00] font-bold">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-[#111111] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
        <p className="text-gray-400 mb-8">Spots fill up fast — especially on weekends.</p>
        <Link
          href="/book"
          className="inline-block bg-[#FFCC00] text-[#111] font-bold text-base px-10 py-4 rounded-xl hover:bg-yellow-400 transition-colors"
        >
          Book a Stay Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#2a2a2a] py-10 px-6 text-center">
        <p className="text-gray-500 text-sm">© 2026 Bejaa Pet Hotel & Clinic. All rights reserved.</p>
        <p className="text-gray-600 text-xs mt-2">Powered by Bejaa Digital</p>
      </footer>

      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/60178399812?text=Hi%20Farizal%2C%20saya%20berminat%20nak%20bina%20sistem%20macam%20ni%20untuk%20bisnes%20saya"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-[#1ebe5d] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.851L.057 23.944a.75.75 0 00.92.92l6.101-1.464A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 01-4.964-1.362l-.355-.212-3.686.884.899-3.678-.232-.368A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        Build with us
      </a>
    </div>
  )
}
