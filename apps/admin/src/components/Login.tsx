"use client"
import { useState, useRef } from "react"

export default function LoginPage() {
  const [pos, setPos] = useState(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const maxSlide = 220

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    startX.current = e.clientX - pos
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const newPos = Math.min(Math.max(0, e.clientX - startX.current), maxSlide)
    setPos(newPos)
  }

  const onPointerUp = () => {
    dragging.current = false
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
      <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>SpiceVeg Admin</h1>
      <p style={{ color: "#666", marginBottom: 56, fontSize: 15 }}>Slide to enter</p>

      <div ref={trackRef} style={{ position: "relative", width: 280, height: 56, background: "#1a1a1a", borderRadius: 999, display: "flex", alignItems: "center", padding: "0 4px", border: "1px solid #2a2a2a" }}>
        <span style={{ position: "absolute", width: "100%", textAlign: "center", color: "#444", fontSize: 13, pointerEvents: "none", userSelect: "none" }}>
          slide to enter →
        </span>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            width: 48,
            height: 48,
            background: "#2d7a3a",
            borderRadius: 999,
            cursor: "grab",
            transform: `translateX(${pos}px)`,
            transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            touchAction: "none",
            userSelect: "none"
          }}
        >
          →
        </div>
      </div>
    </div>
  )
}
