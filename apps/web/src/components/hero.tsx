"use client";
import React from "react";
import { motion } from "framer-motion";
import { LightRays } from "./light-rays";

const ease = [0.22, 1, 0.36, 1] as const;

const HandUnderline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 320 18"
    fill="none"
    aria-hidden="true"
    preserveAspectRatio="none"
    className={className}
  >
    <path
      d="M4 12 Q 60 2, 120 9 T 240 8 T 316 7"
      stroke="#8a8c5a"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.65"
    />
  </svg>
);

const LeafMark: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M32 50 V28"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M32 32 C24 30 18 22 18 14 C26 14 32 22 32 32 Z"
      fill="currentColor"
      opacity="0.85"
    />
    <path
      d="M32 34 C40 32 46 24 46 16 C38 16 32 24 32 34 Z"
      fill="currentColor"
      opacity="0.55"
    />
  </svg>
);

export const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-20 md:pt-24 lg:pt-28 pb-20 overflow-hidden bg-bg-primary"
    >
      {/* Tiny floating logo mark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease }}
        className="absolute top-6 left-6 md:top-8 md:left-10 lg:top-10 lg:left-14 z-20 flex items-center gap-2 text-ink/80"
      >
        <LeafMark className="w-6 h-6 md:w-7 md:h-7" />
        <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.32em] text-ink/55">
          Spice Veg Agri
        </span>
      </motion.div>

      {/* Gradient mesh atmosphere */}
      <div className="gradient-mesh" />

      {/* Light rays — desktop dominant, soft on mobile */}
      <LightRays intensity={0.95} followMouse />

      <div className="relative z-10 max-w-[1600px] mx-auto px-5 md:px-10 lg:px-14 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
        {/* Left — copy */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-ink/55 mb-6 md:mb-8"
          >
            <span className="inline-block w-8 h-px bg-ink/40 align-middle mr-3" />
            Truthful seeds · Since 2022
          </motion.div>

          <h1 className="font-display text-ink leading-[0.92] tracking-[-0.02em] text-balance">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease }}
              className="block text-[14vw] md:text-[10vw] lg:text-[8.2vw] xl:text-[7.6vw]"
            >
              Seeds
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease }}
              className="block text-[13vw] md:text-[9vw] lg:text-[7.4vw] xl:text-[6.8vw]"
            >
              of today.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.55, ease }}
              className="block font-editorial italic text-accent-olive text-[14vw] md:text-[10vw] lg:text-[8.2vw] xl:text-[7.6vw] mt-2 lg:mt-3"
            >
              Harvests
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.7, ease }}
              className="relative inline-block text-[13vw] md:text-[9vw] lg:text-[7.4vw] xl:text-[6.8vw]"
            >
              of tomorrow.
              <HandUnderline className="absolute -bottom-1 left-0 w-[80%] h-3" />
            </motion.span>
          </h1>

          {/* Body copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease }}
            className="mt-8 md:mt-10 text-base md:text-lg text-ink/75 max-w-md leading-relaxed"
          >
            Premium vegetable seeds crafted with science, nurtured by nature,
            and trusted by thousands of farmers across India.
          </motion.p>

          {/* Launching soon tape badge + scroll cue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease }}
            className="mt-10 md:mt-12 flex flex-wrap items-center gap-6 md:gap-10"
          >
            <div className="tape-badge px-6 md:px-7 py-3 rounded-md transform -rotate-[1.2deg]">
              <div className="flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22V12" stroke="#202A2D" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M12 13c-4-1-7-4-7-9 4 0 7 3 7 9Z" fill="#202A2D" opacity="0.85"/>
                  <path d="M12 13c4-1 7-4 7-9-4 0-7 3-7 9Z" fill="#202A2D" opacity="0.55"/>
                </svg>
                <div className="leading-tight">
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink font-semibold">
                    Launching Soon
                  </div>
                  <div className="font-hand text-[13px] text-ink/70">
                    Stay tuned for something extraordinary.
                  </div>
                </div>
              </div>
            </div>

            <a
              href="#philosophy"
              className="group inline-flex items-center gap-3 text-ink/75 hover:text-ink transition-colors"
            >
              <span className="inline-flex w-11 h-11 rounded-full border border-ink/30 items-center justify-center group-hover:border-ink/70 transition-colors group-hover:scale-105">
                <span className="block w-1.5 h-1.5 rounded-full bg-ink/70 group-hover:translate-y-1 transition-transform duration-700" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em]">
                Scroll to Explore
              </span>
            </a>
          </motion.div>
        </div>

        {/* Right — farmer image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease }}
          className="relative aspect-[4/5] md:aspect-[4/5] lg:aspect-[4/5.2] w-full max-w-[640px] lg:max-w-none mx-auto"
        >
          {/* Brush-edge mask container */}
          <div className="relative w-full h-full">
            {/* SVG brushed mask using clipPath-like radius + multiple overlays for organic edge */}
            <div
              className="absolute inset-0 rounded-[28px] md:rounded-[40px] lg:rounded-[56px] overflow-hidden bg-bg-secondary archival is-warm"
              style={{
                maskImage:
                  "radial-gradient(120% 110% at 50% 45%, #000 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(120% 110% at 50% 45%, #000 65%, transparent 100%)",
              }}
            >
              <img
                src="/GPTFARMER.png"
                alt="A SpiceVeg farmer in the field at golden hour"
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              {/* Warm light wash on image */}
              <div
                className="absolute inset-0 mix-blend-soft-light"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,232,170,0.7) 0%, transparent 60%)",
                }}
              />
              {/* Subtle vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 60%, rgba(32,42,45,0.18) 100%)",
                }}
              />
            </div>

            {/* Brush stroke bottom (organic edge) */}
            <svg
              className="absolute -bottom-1 -left-2 -right-2 w-[104%] h-12 md:h-16"
              viewBox="0 0 400 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 10 C 40 50, 80 0, 120 20 S 200 50, 240 18 S 320 50, 400 12 L 400 60 L 0 60 Z"
                fill="#F7F5EB"
              />
            </svg>

            {/* Sticky note: "From our fields to your future." */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ duration: 1.2, delay: 1.3, ease }}
              className="sticky-note hidden md:block absolute -bottom-4 -right-2 lg:-right-6 px-6 py-5 rounded-md max-w-[200px]"
            >
              <div className="font-hand text-lg text-ink/85 leading-[1.2]">
                From our fields<br />
                to your future.
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom marquee — Hindi/English tagline strip */}
      <div className="relative z-10 mt-16 md:mt-24 overflow-hidden border-y border-line/60 bg-bg-secondary/40">
        <div className="flex whitespace-nowrap animate-marquee-x py-3 font-mono text-[11px] uppercase tracking-[0.4em] text-ink/55">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="px-8 inline-flex items-center gap-8">
              Sustainable by Nature
              <span className="opacity-40">✦</span>
              Farmer First
              <span className="opacity-40">✦</span>
              Science with Soul
              <span className="opacity-40">✦</span>
              Trust We Earn
              <span className="opacity-40">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
