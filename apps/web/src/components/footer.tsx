"use client";
import React from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const LeafMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
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
      opacity="0.8"
    />
    <path
      d="M32 32 C24 30 18 22 18 14 C26 14 32 22 32 32 Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M32 34 C40 32 46 24 46 16 C38 16 32 24 32 34 Z"
      fill="currentColor"
      opacity="0.65"
    />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#171717] text-bg-primary pt-24 md:pt-28 lg:pt-32 pb-10 overflow-hidden">
      {/* Soft glow */}
      <div
        className="absolute inset-x-0 -top-32 h-64 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(203,208,181,0.25), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-[1500px] mx-auto px-5 md:px-10 lg:px-16">
        {/* Top — oversized wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-14 border-b border-bg-primary/15"
        >
          <div className="flex items-center gap-5">
            <LeafMark size={56} className="text-bg-primary" />
            <div className="font-display text-[12vw] md:text-[7vw] lg:text-[5vw] leading-[0.9] tracking-[-0.02em]">
              Spice <span className="font-editorial italic text-accent-sage">Veg</span> Agri
            </div>
          </div>
          <div className="font-hand text-xl md:text-2xl text-bg-primary/70 max-w-sm">
            Rooted in trust. Growing the future. — Since 2022.
          </div>
        </motion.div>

        {/* Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 py-14">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-bg-primary/55 mb-5">
              Headquarters
            </div>
            <p className="text-base text-bg-primary/85 leading-relaxed">
              H. No. 1-3/1, Sri Rangavaram<br />
              Medchal Mandal, Hyderabad<br />
              Telangana, India — 501401
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-bg-primary/55 mb-5">
              Directorate
            </div>
            <p className="text-base text-bg-primary/85 leading-relaxed">
              Venkata Rama Rao Pasupuleti
              <br />
              <span className="text-bg-primary/55 text-sm">Director</span>
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-bg-primary/55">
              CIN · U01100TG2022PTC162399
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-bg-primary/55 mb-5">
              Get in Touch
            </div>
            <a
              href="tel:+919177155542"
              className="block text-base text-bg-primary/85 hover:text-bg-primary transition"
            >
              +91 91771 55542
            </a>
            <a
              href="mailto:contact@spiceveg.in"
              className="mt-2 inline-flex items-center gap-2 group"
            >
              <span className="font-editorial italic text-xl text-bg-primary">
                contact@spiceveg.in
              </span>
              <span className="opacity-60 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </a>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-bg-primary/55 mb-5">
              Navigate
            </div>
            <ul className="space-y-2.5 text-base text-bg-primary/85">
              <li>
                <a href="#hero" className="hover:text-bg-primary transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#philosophy" className="hover:text-bg-primary transition">
                  Our Philosophy
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-bg-primary transition">
                  Innovation
                </a>
              </li>
              <li>
                <a
                  href="https://verify.spiceveg.in"
                  className="hover:text-bg-primary transition"
                >
                  Verify a label
                </a>
              </li>
              <li className="text-bg-primary/55">
                Products{" "}
                <span className="font-mono text-[10px] tracking-[0.28em] uppercase ml-1">
                  — soon
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-bg-primary/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-bg-primary/50 font-mono text-[10px] uppercase tracking-[0.28em]">
          <div>© 2026 Spice Veg Agri Seeds Pvt Ltd · All rights reserved</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-bg-primary transition">
              Privacy
            </a>
            <a href="#" className="hover:text-bg-primary transition">
              Terms
            </a>
            <span className="text-bg-primary/30">RoC · Hyderabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
