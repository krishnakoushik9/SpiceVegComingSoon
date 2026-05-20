"use client"
import { useEffect, useState } from "react"

const FB_API_KEY = "AIzaSyCXh_4FVtBnM83-QRP4MhwPB3juiDSr4"
const FS_BASE = "https://firestore.googleapis.com/v1/projects/spice-veg-agri/databases/(default)/documents"

async function fsGet(id: string) {
  const res = await fetch(`${FS_BASE}/seed_labels/lot_${id}?key=${FB_API_KEY}`)
  if (!res.ok) return null
  const doc = await res.json()
  if (!doc.fields) return null
  const out: any = {}
  for (const [k, v] of Object.entries(doc.fields as any)) {
    out[k] = (v as any).stringValue ?? (v as any).integerValue ?? ''
  }
  return out
}

export default function VerifyPage() {
  const [data, setData] = useState<any>(null)
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
    <div style={{position:'fixed',inset:0,background:'#fff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:40,height:40,border:'3px solid #EAF3DE',borderTop:'3px solid #3B6D11',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{color:'#7A8F6A',fontSize:14}}>Verifying label...</span>
    </div>
  )

  if (notFound) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",textAlign:'center',padding:'100px 20px',color:'#1A2410'}}>
      <div style={{fontSize:40}}>⚠️</div>
      <h3>Information Not Found</h3>
      <p style={{color:'#7A8F6A'}}>The QR code you scanned is invalid or the record has been removed.</p>
    </div>
  )

  const rows: [string, string][] = [
    ['Crop', data.crop],
    ['Variety', data.variety],
    ['Lot No', data.lotNo],
    ['Date of Testing', data.dot],
    ['Date of Packing', data.dop],
    ['Valid Upto', data.validUpto],
    ['Net Weight', data.netWeight + ' g'],
    ['MRP', '₹' + data.mrp + '/-'],
  ]

  const qualityRows: [string, string][] = [
    ['Physical Purity', data.physicalPurity],
    ['Genetic Purity', data.geneticPurity],
    ['Germination', data.germination],
    ['Moisture', data.moisture],
  ].filter(([, v]) => v) as [string, string][]

  const cropKey = (data.crop || '').toLowerCase().replace(/\s+/g, '_')

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:'#FFFFFF',display:'flex',justifyContent:'center',minHeight:'100vh'}}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{width:'100%',maxWidth:480,padding:'0 16px',boxSizing:'border-box' as any}}>

        {/* Header */}
        <div style={{textAlign:'center',padding:'40px 0 20px',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{fontSize:48,marginBottom:8}}>🌿</div>
          <div style={{fontFamily:'serif',fontWeight:600,fontSize:22,color:'#1A2410'}}>SpiceVeg</div>
          <div style={{fontSize:12,color:'#7A8F6A',letterSpacing:2,textTransform:'uppercase' as any,marginTop:2}}>Agri Seeds</div>
          <div style={{display:'inline-flex',alignItems:'center',background:'#EAF3DE',color:'#3B6D11',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,margin:'10px 0'}}>
            ✓ Verified Truthful Label
          </div>
        </div>

        {/* Data Card */}
        <div style={{background:'#F7F9F4',border:'1px solid #D4DCC8',borderRadius:12,padding:16,animation:'fadeIn 0.3s ease'}}>
          {rows.map(([label, value]) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #D4DCC8'}}>
              <span style={{fontSize:13,color:'#4A5C3A',fontWeight:500}}>{label}</span>
              <span style={{fontSize:14,color:'#1A2410',fontWeight:600}}>{value}</span>
            </div>
          ))}
        </div>

        {/* Quality Parameters */}
        {qualityRows.length > 0 && (
          <div style={{background:'#F7F9F4',border:'1px solid #D4DCC8',borderRadius:12,padding:16,marginTop:16,animation:'fadeIn 0.3s ease'}}>
            <div style={{fontSize:11,color:'#3B6D11',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase' as any,marginBottom:6}}>
              Quality Parameters
            </div>
            {qualityRows.map(([label, value], i) => (
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom: i === qualityRows.length - 1 ? 'none' : '1px solid #D4DCC8'}}>
                <span style={{fontSize:13,color:'#4A5C3A',fontWeight:500}}>{label}</span>
                <span style={{fontSize:14,color:'#1A2410',fontWeight:600}}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cultivation Button */}
        <button
          onClick={() => setLightbox(true)}
          style={{width:'100%',marginTop:20,background:'#3B6D11',color:'#fff',border:'none',borderRadius:8,padding:'11px 20px',fontSize:15,fontWeight:500,cursor:'pointer'}}
        >
          🌱 View Cultivation Techniques
        </button>

        <p style={{textAlign:'center',fontSize:11,color:'#7A8F6A',marginTop:32}}>
          © 2026 SPICE VEG AGRI • Scan to verify quality
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:2000,display:'flex',alignItems:'flex-start',justifyContent:'center',overflowY:'auto',padding:'40px 0'}}>
          <img
            src={`/technique_${cropKey}.png`}
            onError={(e) => { (e.target as HTMLImageElement).src = '/src/practices.jpg' }}
            style={{width:'90%',maxWidth:480,borderRadius:12}}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
