"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onOpenBlueprint: () => void;
}

const links = [
  { label: "Home", href: "#hero", soon: false },
  { label: "About Us", href: "#philosophy", soon: false },
  { label: "Our Philosophy", href: "#philosophy", soon: false },
  { label: "Farmers", href: "#showcase", soon: false },
  { label: "Innovation", href: "#journey", soon: false },
  { label: "Products", href: "#cta", soon: true },
];

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

export const Navbar = ({ onOpenBlueprint }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 ${
          scrolled
            ? "bg-bg-primary/80 backdrop-blur-xl border-b border-line/60"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 lg:px-14 py-5 md:py-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <LeafMark size={32} className="text-ink" />
            <div className="leading-tight">
              <div className="font-editorial text-lg md:text-xl text-ink tracking-tight">
                Spice Veg Agri Seeds
              </div>
              <div className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.32em] text-ink/55 mt-0.5">
                Rooted in trust. Growing the future.
              </div>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-8 xl:gap-10">
            {links.map((l) => (
              <li key={l.label} className="relative group">
                <a
                  href={l.href}
                  className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/80 hover:text-ink transition-colors"
                >
                  {l.label}
                  {l.soon && (
                    <span className="ml-2 text-accent-olive">— SOON</span>
                  )}
                </a>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-ink/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-bezier" />
              </li>
            ))}
          </ul>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBlueprint}
              className="hidden md:inline-flex items-center gap-2 bg-bg-dark text-bg-primary px-5 md:px-6 py-3 rounded-full font-mono text-[10px] uppercase tracking-[0.28em] hover:bg-ink transition-all duration-500 ease-bezier hover:gap-3 group"
            >
              Contact Us
              <span className="inline-flex w-5 h-5 rounded-full bg-bg-primary/15 items-center justify-center group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
              className="lg:hidden w-10 h-10 rounded-full border border-ink/15 inline-flex items-center justify-center hover:bg-ink/5 transition"
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`block w-4 h-px bg-ink transition-transform ${
                    mobileOpen ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block w-4 h-px bg-ink transition-transform ${
                    mobileOpen ? "-translate-y-[3px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[88px] z-[999] bg-bg-primary/95 backdrop-blur-xl border-b border-line lg:hidden"
          >
            <ul className="px-6 py-8 space-y-5">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-display text-3xl text-ink"
                  >
                    {l.label}
                    {l.soon && (
                      <span className="ml-2 font-mono text-[10px] tracking-[0.32em] text-accent-olive uppercase">
                        soon
                      </span>
                    )}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenBlueprint();
                  }}
                  className="bg-bg-dark text-bg-primary px-6 py-3 rounded-full font-mono text-[10px] uppercase tracking-[0.28em]"
                >
                  Contact Us →
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
