"use client";
import React from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const Icons = {
  leaf: (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="w-7 h-7">
      <path d="M14 22 V12 M14 13c-4-1-7-4-7-9 4 0 7 3 7 9Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M14 13c4-1 7-4 7-9-4 0-7 3-7 9Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="w-7 h-7">
      <path d="M14 18a4 4 0 0 0 0-8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M4 18h20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M14 4v2 M14 22v-2 M5 9l2 1 M21 9l-2 1 M6 16l2-1 M20 16l-2-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="w-7 h-7">
      <path d="M11 3v6L6 21a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 22 21l-5-12V3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M11 3h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M8 16h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="w-7 h-7">
      <path d="M3 14l4-4 4 2 3-3 4 1 4 4-5 5-3-2-3 2-4-3-4-2Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
      <path d="M11 13l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

const cards = [
  {
    n: "01",
    title: "Sustainable",
    titleAlt: "by Nature",
    body:
      "Our seeds are bred for resilience, productivity and environmental harmony.",
    icon: Icons.leaf,
    dark: false,
  },
  {
    n: "02",
    title: "Farmer",
    titleAlt: "First",
    body:
      "Every decision we make starts with the farmer and their success.",
    icon: Icons.sun,
    dark: true,
  },
  {
    n: "03",
    title: "Science",
    titleAlt: "with Soul",
    body:
      "Advanced seed research meets traditional wisdom to deliver real results.",
    icon: Icons.flask,
    dark: false,
  },
  {
    n: "04",
    title: "Trust",
    titleAlt: "We Earn",
    body:
      "Decades of trust built on purity, performance and transparency.",
    icon: Icons.handshake,
    dark: false,
  },
];

const SidewaysLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`v-label ${className}`}>{children}</div>;

export const PhilosophySection: React.FC = () => {
  return (
    <section
      id="philosophy"
      className="relative bg-bg-primary py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Vertical mono label, left edge */}
      <SidewaysLabel className="hidden lg:block absolute top-32 left-6 text-ink/55">
        Our Philosophy
      </SidewaysLabel>

      <div className="max-w-[1500px] mx-auto px-5 md:px-10 lg:px-16 grid lg:grid-cols-[1fr_2.4fr] gap-12 lg:gap-16 items-start">
        {/* Left — heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.1, ease }}
          className="relative"
        >
          <h2 className="font-display text-ink leading-[0.95] tracking-[-0.02em] text-[10vw] md:text-[6.4vw] lg:text-[4.6vw]">
            We believe<br />
            in more than<br />
            just <span className="font-editorial italic text-accent-olive">growing.</span>
          </h2>

          <p className="mt-8 text-base md:text-lg text-ink/70 max-w-md leading-relaxed">
            We believe in responsible farming, seed intelligence, and building
            a better future for farmers, families and the planet.
          </p>

          <a
            href="#showcase"
            className="group mt-10 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-ink hover:text-accent-indigo transition-colors"
          >
            Know Our Story
            <span className="inline-flex w-8 h-8 rounded-full border border-ink/30 items-center justify-center group-hover:border-accent-indigo transition-colors">
              →
            </span>
          </a>

          {/* Decorative plant sketch */}
          <svg
            aria-hidden="true"
            viewBox="0 0 140 200"
            className="hidden lg:block absolute -bottom-32 -left-4 w-32 opacity-30"
          >
            <path
              d="M70 195 V60"
              stroke="#202A2D"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M70 130 C 40 120, 25 95, 25 70 C 50 75, 65 100, 70 130"
              stroke="#202A2D"
              strokeWidth="1"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M70 100 C 100 90, 115 65, 115 40 C 90 45, 75 70, 70 100"
              stroke="#202A2D"
              strokeWidth="1"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M70 70 C 50 62, 42 42, 42 22 C 60 26, 68 46, 70 70"
              stroke="#202A2D"
              strokeWidth="1"
              fill="none"
              opacity="0.8"
            />
          </svg>
        </motion.div>

        {/* Right — cards */}
        <div className="relative">
          {/* Handwritten margin note */}
          <div className="hidden lg:block absolute -right-10 xl:-right-2 top-1/2 -translate-y-1/2 max-w-[170px] pointer-events-none">
            <div className="font-hand text-xl text-ink/75 leading-[1.15] rotate-[8deg]">
              Built on values,<br />
              driven by purpose.
            </div>
            <svg viewBox="0 0 80 60" fill="none" className="w-14 mt-1 rotate-[12deg]">
              <path
                d="M70 6 C 50 14, 30 26, 14 44"
                stroke="#202A2D"
                strokeWidth="1.2"
                strokeDasharray="2 4"
                opacity="0.55"
              />
              <path
                d="M14 44 L 22 36 M 14 44 L 10 34"
                stroke="#202A2D"
                strokeWidth="1.2"
                opacity="0.6"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {cards.map((c, idx) => (
              <motion.article
                key={c.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1, delay: idx * 0.1, ease }}
                className={`group relative paper-texture rounded-organic p-7 md:p-8 min-h-[280px] flex flex-col transition-colors duration-700 ease-bezier ${
                  c.dark
                    ? "bg-[#3a3d28] text-bg-primary"
                    : "bg-bg-secondary text-ink hover:bg-[#3a3d28] hover:text-bg-primary"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full inline-flex items-center justify-center mb-7 transition-colors ${
                    c.dark
                      ? "bg-bg-primary/15 text-bg-primary"
                      : "bg-bg-primary text-ink/85 group-hover:bg-bg-primary/15 group-hover:text-bg-primary"
                  }`}
                >
                  {c.icon}
                </div>

                <h3 className="font-display text-2xl md:text-[26px] leading-[1.05]">
                  {c.title}<br />
                  {c.titleAlt}
                </h3>

                <p
                  className={`text-sm mt-4 leading-relaxed flex-1 ${
                    c.dark ? "text-bg-primary/75" : "text-ink/70 group-hover:text-bg-primary/75"
                  }`}
                >
                  {c.body}
                </p>

                <div
                  className={`font-mono text-[10px] tracking-[0.32em] mt-6 ${
                    c.dark ? "text-bg-primary/55" : "text-ink/40 group-hover:text-bg-primary/55"
                  }`}
                >
                  {c.n}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
