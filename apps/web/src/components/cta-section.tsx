"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface CTASectionProps {
  onOpenBlueprint: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenBlueprint }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    // Existing backend wiring (if any) is preserved by the parent — this
    // component only manages local UI state. A future hook can POST to
    // api.spiceveg.in here without touching the design.
  };

  return (
    <section
      id="cta"
      className="relative bg-bg-primary py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      <div className="gradient-mesh opacity-50" />

      <div className="relative z-10 max-w-[1300px] mx-auto px-5 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.2, ease }}
          className="relative rounded-cinema lg:rounded-editorial overflow-hidden bg-[#1F241D] text-bg-primary paper-texture"
        >
          {/* Atmospheric glow */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 70% 30%, rgba(203,208,181,0.32), transparent 60%)," +
                "radial-gradient(ellipse 60% 60% at 20% 80%, rgba(255,220,178,0.20), transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          {/* Decorative botanical sketch */}
          <svg
            viewBox="0 0 600 600"
            aria-hidden="true"
            className="absolute -right-12 -bottom-20 w-[420px] opacity-[0.12] text-bg-primary hidden md:block"
          >
            <path d="M300 580 V200" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M300 380 C 220 360, 160 300, 160 240 C 240 250, 290 310, 300 380 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M300 310 C 380 290, 440 230, 440 170 C 360 180, 310 240, 300 310 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M300 250 C 240 230, 200 170, 200 110 C 260 120, 295 180, 300 250 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="300" cy="200" r="22" fill="currentColor" opacity="0.5" />
          </svg>

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-12 p-10 md:p-14 lg:p-20">
            {/* Left — copy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-bg-primary/70" fill="none">
                  <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 7l9 7 9-7" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bg-primary/70">
                  Be the first to know
                </span>
              </div>
              <h2 className="font-display leading-[0.95] tracking-[-0.02em] text-[10vw] md:text-[5vw] lg:text-[3.6vw]">
                Get launch updates,<br />
                seed insights and<br />
                <span className="font-editorial italic text-accent-sage">farming stories.</span>
              </h2>
              <p className="mt-6 text-bg-primary/65 max-w-md leading-relaxed">
                We're cultivating something rare. Drop your email and we'll
                send a quiet note when we open the gates.
              </p>
            </div>

            {/* Right — form */}
            <div className="lg:pl-6 flex flex-col justify-end">
              <form
                onSubmit={onSubmit}
                className="relative flex flex-col sm:flex-row items-stretch gap-3 bg-bg-primary/5 backdrop-blur-md rounded-full p-2 border border-bg-primary/15"
              >
                <input
                  type="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent px-5 py-3 placeholder:text-bg-primary/45 text-bg-primary focus:outline-none font-sans text-sm md:text-[15px]"
                />
                <button
                  type="submit"
                  className="bg-bg-primary text-ink px-6 md:px-7 py-3 rounded-full font-mono text-[10px] uppercase tracking-[0.32em] hover:bg-bg-secondary transition-colors duration-500 ease-bezier disabled:opacity-60"
                  disabled={submitted}
                >
                  {submitted ? "On the list" : "Notify Me"}
                  <span className="ml-2">→</span>
                </button>
              </form>

              <p className="mt-4 font-hand text-bg-primary/60 text-base">
                {submitted
                  ? "Thank you — we'll send a note soon."
                  : "We respect inboxes. No spam, ever."}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] text-bg-primary/55 font-mono uppercase tracking-[0.28em]">
                <button
                  onClick={onOpenBlueprint}
                  className="hover:text-bg-primary transition-colors"
                >
                  Growth Blueprint →
                </button>
                <span className="opacity-40">|</span>
                <a
                  href="https://verify.spiceveg.in"
                  className="hover:text-bg-primary transition-colors"
                >
                  Verify a label
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
