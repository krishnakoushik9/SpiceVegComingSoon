"use client";
import React from "react";
import { motion } from "framer-motion";

export const ContentSection = () => {
  return (
    <section className="relative z-10 px-[7vw] py-[clamp(5rem,15vh,12rem)] rounded-[5rem] -mt-20 bg-olive shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-[8vw] max-w-[1400px] mx-auto items-center">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Our Science</span>
          <h2 className="font-anton uppercase leading-[0.8] tracking-[-0.04em] text-[clamp(3rem,8vw,6rem)] mt-8">
            REDEFINING <br />
            <span className="font-serif italic normal-case">Growth</span>
          </h2>
          <p className="mt-10 text-[clamp(1.1rem,2vw,1.4rem)] max-w-[600px] opacity-85 leading-relaxed">
            Founded on May 9th, 2022, SPICEVEG AGRI SEEDS PVT LTD is dedicated to the development of high-yield vegetable seeds through scientific precision and organic integrity.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 p-[clamp(2rem,5vw,4rem)] rounded-[3rem] backdrop-blur-[25px] border border-white/40 shadow-[0_40px_100px_rgba(1,71,46,0.08)]"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Directorate</span>
          <h3 className="mt-6 font-bold text-2xl">Venkata Rama Rao Pasupuleti</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2 text-forest opacity-70">Director</p>
          <div className="mt-12 pt-8 border-t border-forest/10">
            <p className="text-[0.9rem] font-bold">CIN: U01100TG2022PTC162399</p>
            <p className="text-[0.8rem] mt-2 opacity-60">RoC-Hyderabad</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
