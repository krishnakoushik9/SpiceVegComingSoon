"use client"
import { useEffect, useState } from "react"

const FB_API_KEY = "AIzaSyCXh_4FVtBnM83-QRP4MhwPB3juiDSr4"
const FS_BASE = "https://firestore.googleapis.com/v1/projects/spice-veg-agri/databases/(default)/documents"

async function fsGet(id: string) {
  const res = await fetch(`${FS_BASE}/seed_labels/lot_${id}?key=${FB_API_KEY}`)
  if (!res.ok) return null
  const doc = await res.json()
  if (!doc.fields) return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(doc.fields as Record<string, { stringValue?: string; integerValue?: string }>)) {
    out[k] = v.stringValue ?? v.integerValue ?? ''
  }
  return out
}

const Mark = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="31" fill="#F4F1E5" stroke="#A3B18A" strokeWidth="1" />
    <path d="M32 46 V28" stroke="#01472e" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M32 30 C26 28 20 22 20 16 C26 16 31 21 32 30 Z" fill="#01472e" />
    <path d="M32 32 C38 30 44 24 44 18 C38 18 33 23 32 32 Z" fill="#3a5d2a" />
    <circle cx="32" cy="48" r="2" fill="#7a6647" />
  </svg>
)

type IconName = 'sprout' | 'leaf' | 'tag' | 'flask' | 'box' | 'clock' | 'scale' | 'rupee' | 'shield' | 'beaker' | 'drop' | 'dna' | 'factory'

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => {
  const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case 'sprout': return <svg {...s}><path d="M12 20V10"/><path d="M12 10c-3 0-6-2-6-6 3 0 6 2 6 6Z"/><path d="M12 10c3 0 6-2 6-6-3 0-6 2-6 6Z"/></svg>
    case 'leaf': return <svg {...s}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.8 2c1 5 .5 10-6.7 11.9"/><path d="M2 22s7-6 11-6"/></svg>
    case 'tag': return <svg {...s}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></svg>
    case 'flask': return <svg {...s}><path d="M9 2v6L4 18a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 18L15 8V2"/><path d="M9 2h6"/><path d="M7 14h10"/></svg>
    case 'box': return <svg {...s}><path d="m21 16-9 5-9-5V8l9-5 9 5v8Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    case 'clock': return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'scale': return <svg {...s}><path d="M12 3v18"/><path d="M5 21h14"/><path d="m5 8 3 9h-6Z"/><path d="m19 8 3 9h-6Z"/><path d="M5 8h14"/></svg>
    case 'rupee': return <svg {...s}><path d="M6 4h12"/><path d="M6 8h12"/><path d="M14 4a4 4 0 0 1 0 8H6l8 9"/></svg>
    case 'shield': return <svg {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
    case 'beaker': return <svg {...s}><path d="M5 3h14"/><path d="M6 3v14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V3"/><path d="M6 12h12"/></svg>
    case 'drop': return <svg {...s}><path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12Z"/></svg>
    case 'dna': return <svg {...s}><path d="M4 4c6 0 10 4 16 16"/><path d="M20 4c-6 0-10 4-16 16"/><path d="M7 7h2"/><path d="M15 17h2"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>
    case 'factory': return <svg {...s}><path d="M3 21V10l5 3V10l5 3V10l8 5v6Z"/><path d="M7 18h2"/><path d="M13 18h2"/></svg>
  }
}

const Decoration = () => (
  <>
    <svg aria-hidden="true" className="pointer-events-none fixed -top-12 -left-12 w-56 md:w-72 opacity-[0.07] -z-10" viewBox="0 0 200 200" fill="none">
      <path d="M20 180 C 40 120, 80 80, 180 20" stroke="#01472e" strokeWidth="1.2" />
      <path d="M60 160 C 40 130, 50 100, 90 90 C 70 110, 70 140, 60 160 Z" fill="#01472e" />
      <path d="M110 100 C 90 80, 100 50, 140 40 C 120 60, 120 90, 110 100 Z" fill="#01472e" />
      <path d="M160 60 C 140 40, 150 10, 190 0 C 170 20, 170 50, 160 60 Z" fill="#01472e" />
    </svg>
    <svg aria-hidden="true" className="pointer-events-none fixed -bottom-16 -right-16 w-64 md:w-80 opacity-[0.06] -z-10" viewBox="0 0 200 200" fill="none">
      <path d="M180 20 C 160 80, 120 120, 20 180" stroke="#01472e" strokeWidth="1.2" />
      <path d="M140 40 C 160 70, 150 100, 110 110 C 130 90, 130 60, 140 40 Z" fill="#01472e" />
      <path d="M90 90 C 110 110, 100 140, 60 150 C 80 130, 80 110, 90 90 Z" fill="#01472e" />
    </svg>
  </>
)

const Divider = () => (
  <div className="flex items-center justify-center gap-3 my-5" aria-hidden="true">
    <span className="block h-px w-10 bg-moss/60" />
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#01472e" opacity="0.65" /></svg>
    <span className="block h-px w-10 bg-moss/60" />
  </div>
)

type RowDef = { label: string; value: string; icon: IconName }

export default function VerifyPage() {
  const [data, setData] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id")
    if (!id) { setNotFound(true); setLoading(false); return }
    fsGet(id).then(d => {
      if (!d) setNotFound(true)
      else setData(d)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="fixed inset-0 bg-paper flex flex-col items-center justify-center gap-5 font-sans">
      <Decoration />
      <Mark size={56} />
      <div className="flex items-center gap-3">
        <span className="block w-5 h-5 border-2 border-moss/30 border-t-forest rounded-full animate-spin" />
        <span className="text-forest/70 text-sm tracking-wide">Verifying label</span>
      </div>
    </div>
  )

  if (notFound || !data) return (
    <div className="min-h-screen bg-paper font-sans relative">
      <Decoration />
      <div className="max-w-md mx-auto px-6 pt-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-moss/30 mb-6">
          <Icon name="shield" size={28} />
        </div>
        <h1 className="font-serif text-3xl text-forest mb-3">Record Not Found</h1>
        <p className="text-forest/60 text-sm leading-relaxed">
          The QR code you scanned is invalid or the record has been removed from our certification registry.
        </p>
        <Divider />
        <a href="https://spiceveg.in" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-forest/70 hover:text-forest transition-colors">
          Return to SpiceVeg
        </a>
      </div>
    </div>
  )

  const rows: RowDef[] = [
    { label: 'Crop', value: data.crop || '—', icon: 'sprout' },
    { label: 'Variety', value: data.variety || '—', icon: 'leaf' },
    { label: 'Lot Number', value: data.lotNo || '—', icon: 'tag' },
    { label: 'Testing Date', value: data.dot || '—', icon: 'flask' },
    { label: 'Packaging Date', value: data.dop || '—', icon: 'box' },
    { label: 'Valid Until', value: data.validUpto || '—', icon: 'clock' },
    { label: 'Net Weight', value: data.netWeight ? `${data.netWeight} g` : '—', icon: 'scale' },
  ]

  const qualityRows: RowDef[] = [
    { label: 'Physical Purity', value: data.physicalPurity, icon: 'shield' },
    { label: 'Genetic Purity', value: data.geneticPurity, icon: 'dna' },
    { label: 'Germination', value: data.germination, icon: 'beaker' },
    { label: 'Moisture', value: data.moisture, icon: 'drop' },
  ].filter(r => r.value) as RowDef[]

  const producerRows: RowDef[] = [
    { label: 'Produced By', value: data.producedBy, icon: 'sprout' },
    { label: 'Packed By', value: data.packedBy, icon: 'factory' },
    { label: 'Marketed By', value: data.marketedBy, icon: 'tag' },
  ].filter(r => r.value) as RowDef[]

  const cropKey = (data.crop || '').toLowerCase().replace(/\s+/g, '_')

  return (
    <div className="min-h-screen bg-paper font-sans text-forest relative overflow-x-hidden">
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-up { animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-2 { animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both; }
        .fade-up-3 { animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both; }
        @media (prefers-reduced-motion: reduce) { .fade-up, .fade-up-2, .fade-up-3 { animation: none; } }
      `}</style>
      <Decoration />

      {/* NAVBAR */}
      <nav className="sticky top-3 md:top-5 z-30 mx-3 md:mx-6">
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm border border-moss/25 rounded-2xl shadow-[0_6px_24px_-12px_rgba(1,71,46,0.18)] px-4 md:px-6 py-3 flex items-center justify-between">
          <a href="https://spiceveg.in" className="flex items-center gap-3 group">
            <Mark size={36} />
            <div className="leading-tight">
              <div className="font-serif text-lg md:text-xl text-forest">SpiceVeg<sup className="text-[10px] ml-0.5 text-forest/50">™</sup></div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-forest/55">Vegetable Seeds</div>
            </div>
          </a>
          <div className="flex items-center gap-2 bg-olive/60 border border-moss/30 rounded-full pl-2 pr-3 py-1.5 text-xs">
            <span className="w-5 h-5 rounded-full bg-forest text-cream inline-flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6.5 5 9.5 10 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="font-medium text-forest tracking-wide hidden sm:inline">QR Verified</span>
            <span className="font-medium text-forest tracking-wide sm:hidden">Verified</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-6 text-center fade-up">
        <div className="text-[10px] uppercase tracking-[0.4em] text-forest/55 mb-3">Truthful Label Certification</div>
        <h1 className="font-serif text-forest" style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)', lineHeight: 1.05 }}>
          SpiceVeg<sup className="text-base md:text-lg align-super text-forest/50 ml-1">™</sup>
        </h1>
        <Divider />
        <p className="text-sm md:text-base text-forest/65 max-w-md mx-auto leading-relaxed">
          This label has been authenticated against our seed certification registry.
        </p>
      </header>

      {/* MAIN CARD */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 pb-16">
        <section className="bg-white rounded-[28px] border border-moss/25 shadow-[0_20px_60px_-30px_rgba(1,71,46,0.25)] p-6 md:p-10 fade-up-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12c3 0 6-3 6-6 0 3 3 6 6 6-3 0-6 3-6 6 0-3-3-6-6-6Z" fill="#01472e" opacity="0.7"/></svg>
            <h2 className="font-serif text-2xl md:text-3xl text-forest tracking-tight">Truthful Label</h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12c3 0 6-3 6-6 0 3 3 6 6 6-3 0-6 3-6 6 0-3-3-6-6-6Z" fill="#01472e" opacity="0.7"/></svg>
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.32em] text-forest/50 mb-8">Lot {data.lotNo}</p>

          {/* DATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {rows.map((r) => (
              <DataItem key={r.label} {...r} />
            ))}
          </div>

          {/* MRP HIGHLIGHT */}
          <div className="mt-8 rounded-2xl bg-olive/50 border border-moss/30 px-6 py-5 text-center">
            <div className="text-[10px] uppercase tracking-[0.32em] text-forest/55 mb-1">Maximum Retail Price</div>
            <div className="font-serif text-forest" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1 }}>
              <span className="text-forest/60 mr-1 text-[0.7em]">₹</span>{data.mrp || '—'}<span className="text-forest/55 text-[0.5em] ml-1">/-</span>
            </div>
            <div className="text-[10px] text-forest/50 mt-1.5">Inclusive of all taxes</div>
          </div>

          {/* QUALITY PARAMETERS */}
          {qualityRows.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px flex-1 bg-moss/40" />
                <h3 className="font-serif text-base text-forest tracking-wide">Quality Parameters</h3>
                <span className="h-px flex-1 bg-moss/40" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                {qualityRows.map((r) => <DataItem key={r.label} {...r} />)}
              </div>
            </div>
          )}

          {/* PRODUCER DETAILS */}
          {producerRows.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px flex-1 bg-moss/40" />
                <h3 className="font-serif text-base text-forest tracking-wide">Producer Details</h3>
                <span className="h-px flex-1 bg-moss/40" />
              </div>
              <div className="grid grid-cols-1 gap-y-1">
                {producerRows.map((r) => <DataItem key={r.label} {...r} stacked />)}
              </div>
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="mt-8 flex justify-center fade-up-3">
          <button
            onClick={() => setLightbox(true)}
            className="group inline-flex items-center gap-3 bg-forest text-cream px-7 md:px-9 py-3.5 md:py-4 rounded-full text-sm md:text-base font-medium tracking-wide shadow-[0_10px_30px_-12px_rgba(1,71,46,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(1,71,46,0.65)] hover:-translate-y-0.5 transition-all duration-300 ease-out"
          >
            <Icon name="leaf" size={16} />
            View Cultivation Practices
            <span className="opacity-60 group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        {/* FOOTER */}
        <footer className="mt-16 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3" aria-hidden="true">
            <span className="block h-px w-12 bg-moss/40" />
            <Icon name="leaf" size={12} />
            <span className="block h-px w-12 bg-moss/40" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-forest/45">
            © 2026 SpiceVeg Agri · Certified Seed Registry
          </p>
          <p className="text-[10px] text-forest/35 mt-1.5">v2.0 · Scan to verify quality</p>
        </footer>
      </main>

      {/* CULTIVATION LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cultivation practices"
          className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 md:p-10"
          style={{ animation: 'fade-up 0.25s ease-out' }}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close"
              className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-9 h-9 rounded-full bg-cream text-forest border border-moss/40 inline-flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6l-6 6-6 6"/></svg>
            </button>
            <img
              src={`/technique_${cropKey}.png`}
              onError={(e) => { (e.target as HTMLImageElement).src = '/practices.jpg' }}
              alt={`Cultivation practices for ${data.crop || 'crop'}`}
              className="w-full rounded-2xl shadow-2xl bg-cream"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function DataItem({ label, value, icon, stacked }: { label: string; value: string; icon: IconName; stacked?: boolean }) {
  return (
    <div className={`flex items-center gap-4 py-3.5 border-b border-moss/15 last:border-b-0 ${stacked ? 'flex-col items-start sm:flex-row sm:items-center' : ''}`}>
      <div className="shrink-0 w-9 h-9 rounded-xl bg-olive/55 border border-moss/25 inline-flex items-center justify-center text-forest/75">
        <Icon name={icon} size={16} />
      </div>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.16em] text-forest/55 font-medium">{label}</span>
        <span className="text-sm md:text-[15px] text-forest font-semibold text-right truncate max-w-[60%]" title={value}>{value}</span>
      </div>
    </div>
  )
}
