"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * LightRays — a CSS/SVG-driven cinematic light-rays component approximating
 * "sunlight through greenhouse dust". Mouse-follow on desktop only, soft on
 * mobile. No WebGL dependency so it stays fast and ships in a static export.
 */
export const LightRays: React.FC<{
  className?: string;
  intensity?: number; // 0..1
  followMouse?: boolean;
}> = ({ className = "", intensity = 0.9, followMouse = true }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!followMouse || !isDesktop) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setOffset({ x: x * 12, y: y * 6 })
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [followMouse, isDesktop]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      {/* Soft halo at top — sun behind clouds */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] animate-drift-slow"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,236,190,0.55) 0%, rgba(255,236,190,0.18) 30%, transparent 65%)",
          filter: "blur(8px)",
          transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Layer 1 — primary rays */}
      <svg
        className="absolute -top-[10%] left-0 w-full h-[120%] animate-ray-shimmer"
        viewBox="0 0 1200 900"
        preserveAspectRatio="none"
        style={{
          transform: `translate(${offset.x * 0.4}px, 0)`,
          mixBlendMode: "screen",
        }}
      >
        <defs>
          <linearGradient id="ray1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF1C9" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#CBD0B5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#CBD0B5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ray2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE8B4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFE8B4" stopOpacity="0" />
          </linearGradient>
          <filter id="rayBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <g filter="url(#rayBlur)">
          <polygon points="600,-50 540,1000 660,1000" fill="url(#ray1)" />
          <polygon points="600,-50 460,1000 580,1000" fill="url(#ray2)" />
          <polygon points="600,-50 720,1000 840,1000" fill="url(#ray2)" />
          <polygon points="600,-50 380,1000 470,1000" fill="url(#ray1)" opacity="0.55" />
          <polygon points="600,-50 770,1000 920,1000" fill="url(#ray1)" opacity="0.6" />
          <polygon points="600,-50 280,1000 380,1000" fill="url(#ray2)" opacity="0.35" />
          <polygon points="600,-50 870,1000 1000,1000" fill="url(#ray2)" opacity="0.35" />
        </g>
      </svg>

      {/* Layer 2 — fine rays (thinner, slightly offset) */}
      <svg
        className="absolute -top-[8%] left-0 w-full h-[120%] animate-drift-slow"
        viewBox="0 0 1200 900"
        preserveAspectRatio="none"
        style={{
          transform: `translate(${offset.x * 0.2}px, 0)`,
          mixBlendMode: "screen",
          opacity: 0.6,
        }}
      >
        <defs>
          <linearGradient id="rayThin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF5DA" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFF5DA" stopOpacity="0" />
          </linearGradient>
          <filter id="rayBlur2" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g filter="url(#rayBlur2)">
          <polygon points="600,-50 590,1000 610,1000" fill="url(#rayThin)" />
          <polygon points="600,-50 520,1000 545,1000" fill="url(#rayThin)" opacity="0.55" />
          <polygon points="600,-50 700,1000 720,1000" fill="url(#rayThin)" opacity="0.55" />
          <polygon points="600,-50 420,1000 440,1000" fill="url(#rayThin)" opacity="0.35" />
          <polygon points="600,-50 800,1000 820,1000" fill="url(#rayThin)" opacity="0.35" />
        </g>
      </svg>

      {/* Dust particles (top-right, very subtle) */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 30%, rgba(255,240,200,0.9) 1px, transparent 2px)," +
            "radial-gradient(circle at 30% 50%, rgba(255,240,200,0.8) 1px, transparent 2px)," +
            "radial-gradient(circle at 50% 20%, rgba(255,240,200,1) 1px, transparent 2px)",
          backgroundSize: "180px 180px, 240px 240px, 320px 320px",
        }}
      />
    </div>
  );
};
