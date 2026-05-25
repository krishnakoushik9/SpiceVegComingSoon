"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    n: "01",
    title: "Seed Selection",
    body:
      "Hand-picked parent lines from heritage cultivars and elite hybrids.",
    tag: "Genetics",
  },
  {
    n: "02",
    title: "Soil Research",
    body:
      "Field-grade soil intelligence: pH, micronutrients, microbial maps.",
    tag: "Agronomy",
  },
  {
    n: "03",
    title: "Cultivation",
    body:
      "Farmer-led growing trials across climate zones, monitored end to end.",
    tag: "Fieldwork",
  },
  {
    n: "04",
    title: "Harvest",
    body:
      "Yield-optimised harvests with strict purity, vigour and germ checks.",
    tag: "Quality",
  },
  {
    n: "05",
    title: "Distribution",
    body:
      "Traceable, certified packs delivered straight to farmers' hands.",
    tag: "Logistics",
  },
];

export const JourneySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-58%"]);

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative bg-bg-secondary py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto px-5 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55 mb-4">
              The Journey
            </div>
            <h2 className="font-display text-ink leading-[0.95] tracking-[-0.02em] text-[10vw] md:text-[5.4vw] lg:text-[4.2vw] max-w-3xl">
              From soil to <span className="font-editorial italic text-accent-olive">supper.</span>
            </h2>
          </div>
          <p className="max-w-sm text-ink/70 leading-relaxed text-base">
            Five quiet stages stand between a parent seed and the meal it
            becomes. We obsess over every one of them.
          </p>
        </motion.div>

        {/* Desktop horizontal scroll */}
        <div className="hidden lg:block">
          <motion.div
            style={{ x }}
            className="flex gap-6 will-change-transform"
          >
            {steps.map((s) => (
              <article
                key={s.n}
                className="shrink-0 w-[420px] aspect-[3/4] relative rounded-cinema overflow-hidden paper-texture"
              >
                {/* Gradient bg per card */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, #E8E2C8 0%, #D9D5BB 100%)",
                  }}
                />
                {/* Decorative organic shapes */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 420 560"
                  className="absolute inset-0 w-full h-full opacity-40"
                >
                  <defs>
                    <radialGradient id={`g${s.n}`} cx="30%" cy="20%" r="60%">
                      <stop offset="0%" stopColor="#CBD0B5" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#CBD0B5" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="120" r="160" fill={`url(#g${s.n})`} />
                  <path
                    d="M40 480 C 140 420, 280 460, 400 380"
                    stroke="#202A2D"
                    strokeWidth="0.7"
                    fill="none"
                    opacity="0.45"
                    strokeDasharray="3 5"
                  />
                </svg>

                {/* Glass label */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-bg-primary/60 backdrop-blur-md border border-bg-primary/40 rounded-full px-4 py-2">
                  <span className="font-mono text-[10px] tracking-[0.32em] text-ink/70 uppercase">
                    {s.tag}
                  </span>
                </div>

                <div className="absolute top-6 right-7 font-mono text-[10px] tracking-[0.32em] text-ink/55">
                  {s.n}
                </div>

                <div className="absolute left-7 right-7 bottom-7">
                  <h3 className="font-display text-3xl text-ink leading-[1.05] tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-ink/70 text-sm leading-relaxed">
                    {s.body}
                  </p>
                </div>

                {/* Masked edge sweep */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.6) 75%, transparent 90%)",
                  }}
                />
              </article>
            ))}
          </motion.div>
        </div>

        {/* Mobile/tablet: native horizontal scroll */}
        <div className="lg:hidden -mx-5 md:-mx-10 px-5 md:px-10 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 md:gap-5 pb-2">
            {steps.map((s) => (
              <article
                key={s.n}
                className="shrink-0 w-[78vw] sm:w-[55vw] md:w-[42vw] aspect-[3/4] relative rounded-organic overflow-hidden paper-texture bg-[#E8E2C8]"
              >
                <div className="absolute top-5 left-5 bg-bg-primary/70 backdrop-blur-md border border-bg-primary/40 rounded-full px-3 py-1.5">
                  <span className="font-mono text-[9px] tracking-[0.28em] text-ink/70 uppercase">
                    {s.tag}
                  </span>
                </div>
                <div className="absolute top-5 right-5 font-mono text-[9px] tracking-[0.28em] text-ink/55">
                  {s.n}
                </div>
                <div className="absolute left-5 right-5 bottom-5">
                  <h3 className="font-display text-2xl leading-[1.05] tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-ink/70 text-[13px] leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
