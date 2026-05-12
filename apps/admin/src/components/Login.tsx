"use client"
import { useState } from "react"

export default function LoginPage() {
  const [pos, setPos] = useState(0)
  const trackWidth = 280
  const thumbWidth = 56
  const maxSlide = trackWidth - thumbWidth - 8

  const onDrag = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const track = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    const newPos = Math.min(Math.max(0, clientX - track.left - thumbWidth / 2), maxSlide)
    setPos(newPos)
  }

  const onRelease = () => {
    if (pos >= maxSlide * 0.85) {
      setPos(maxSlide)
      setTimeout(() => {
        localStorage.setItem("admin-token", "admin-token")
        window.location.href = "/"
      }, 400)
    } else {
      setPos(0)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
      <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>SpiceVeg Admin</h1>
      <p style={{ color: "#888", marginBottom: 48 }}>Slide to enter</p>

      <div style={{ position: "relative", width: trackWidth, height: 56, background: "#222", borderRadius: 999, display: "flex", alignItems: "center", paddingLeft: 4, paddingRight: 4, userSelect: "none" }}>
        <span style={{ position: "absolute", width: "100%", textAlign: "center", color: "#555", fontSize: 14, pointerEvents: "none" }}>
          slide to enter →
        </span>
        <div
          onMouseDown={(e) => {
            const move = (ev: MouseEvent) => onDrag({ ...e, clientX: ev.clientX } as any)
            const up = () => { onRelease(); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
            window.addEventListener("mousemove", move)
            window.addEventListener("mouseup", up)
          }}
          onTouchMove={onDrag}
          onTouchEnd={onRelease}
          style={{ width: thumbWidth, height: 48, background: "#3a7d44", borderRadius: 999, cursor: "grab", transform: `translateX(${pos}px)`, transition: pos === 0 || pos === maxSlide ? "transform 0.3s" : "none", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}
        >
          →
        </div>
      </div>
    </div>
  )
}
