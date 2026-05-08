"use client";
import React from "react";
import { motion } from "framer-motion";

interface CTASectionProps {
  onOpenBlueprint: () => void;
}

export const CTASection = ({ onOpenBlueprint }: CTASectionProps) => {
  return (
    <section className="relative z-10 px-[7vw] py-[clamp(5rem,15vh,12rem)] rounded-t-[5rem] -mt-20 bg-moss text-center">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-anton uppercase leading-[0.8] tracking-[-0.04em] text-[clamp(4rem,15vw,12rem)]">
          READY TO <br />
          <span className="font-serif italic normal-case">Evolve?</span>
        </h2>
        <p className="font-handwritten text-[clamp(2rem,4vw,3rem)] mt-6 text-forest">
          Launching globally at spiceveg.in
        </p>
        <button 
          onClick={onOpenBlueprint}
          className="mt-12 bg-forest text-cream px-16 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-400 hover:-translate-y-1 hover:bg-[#025a3b]"
        >
          View Growth Blueprint
        </button>
      </motion.div>
    </section>
  );
};
