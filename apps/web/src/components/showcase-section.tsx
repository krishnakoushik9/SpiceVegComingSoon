"use client";
import React from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export const ShowcaseSection: React.FC = () => {
  return (
    <section
      id="showcase"
      className="relative bg-bg-primary py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto px-5 md:px-10 lg:px-16 grid lg:grid-cols-[1.1fr_0.9fr_1fr] gap-6 md:gap-8 items-stretch">
        {/* Left — farmer hands image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease }}
          className="relative aspect-[4/3] lg:aspect-auto rounded-organic overflow-hidden bg-bg-secondary"
        >
          <img
            src="/practices.jpg"
            alt="Hands holding fresh seeds"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover archival is-warm hover:scale-[1.03] transition-transform duration-[1800ms] ease-bezier"
          />
          {/* Play / video cue */}
          <button
            aria-label="Watch our story"
            className="absolute top-5 left-5 w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-primary/90 backdrop-blur inline-flex items-center justify-center border border-line hover:bg-bg-primary transition group"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-ink translate-x-[1px]">
              <path d="M6 4l14 8-14 8V4Z" />
            </svg>
          </button>

          {/* Edge gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(32,42,45,0.0) 60%, rgba(32,42,45,0.35) 100%)",
            }}
          />
        </motion.div>

        {/* Middle — caption */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, delay: 0.1, ease }}
          className="flex items-end p-6 md:p-8 lg:p-10"
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55 mb-4">
              Our Practice
            </div>
            <h3 className="font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.0] tracking-[-0.02em]">
              Nurturing<br />
              life. <span className="font-editorial italic text-accent-olive">Ensuring</span><br />
              prosperity.
            </h3>
            <p className="mt-5 text-sm md:text-base text-ink/70 leading-relaxed max-w-xs">
              Every harvest carries the integrity of our hands, our labs, and
              the soil that raised it.
            </p>
          </div>
        </motion.div>

        {/* Right — large editorial text with floral sketch */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
          className="relative paper-texture rounded-organic p-7 md:p-9 lg:p-10 bg-[#EFE7D2] overflow-hidden flex items-end"
        >
          {/* Floral / pastel gradient bg */}
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              background:
                "radial-gradient(circle at 90% 10%, rgba(196,200,230,0.55), transparent 55%)," +
                "radial-gradient(circle at 80% 80%, rgba(255,210,178,0.5), transparent 60%)",
              filter: "blur(20px)",
            }}
          />
          {/* Hand-drawn flower */}
          <svg
            viewBox="0 0 140 200"
            aria-hidden="true"
            className="absolute right-3 -bottom-2 w-40 md:w-48 opacity-50 text-ink"
          >
            <path d="M70 190 V90" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <ellipse cx="70" cy="60" rx="14" ry="22" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <ellipse cx="70" cy="60" rx="22" ry="14" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <ellipse cx="70" cy="60" rx="20" ry="20" stroke="currentColor" strokeWidth="1.1" fill="none" transform="rotate(45 70 60)" />
            <ellipse cx="70" cy="60" rx="20" ry="20" stroke="currentColor" strokeWidth="1.1" fill="none" transform="rotate(-45 70 60)" />
            <circle cx="70" cy="60" r="6" fill="currentColor" opacity="0.6" />
            {/* leaves */}
            <path d="M70 130 C 50 124, 38 108, 38 92 C 56 96, 68 110, 70 130 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
            <path d="M70 150 C 92 144, 104 128, 104 112 C 86 116, 72 130, 70 150 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
          </svg>

          <div className="relative">
            <h3 className="font-display text-3xl md:text-[40px] lg:text-[44px] leading-[1.0] tracking-[-0.02em]">
              Premium Seeds.<br />
              Proven Performance.<br />
              Promising <span className="font-editorial italic text-accent-olive">Futures.</span>
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
