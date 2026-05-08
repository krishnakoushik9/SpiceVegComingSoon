"use client";
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-forest text-sage px-[7vw] pt-[clamp(6rem,15vh,10rem)] pb-16 rounded-t-[6rem] -mt-24 relative z-20">
      <div className="font-anton text-[clamp(3rem,12vw,12rem)] text-cream leading-[0.8] mb-16">
        SPICEVEG
      </div>
      
      <div className="flex flex-wrap justify-between gap-12 max-w-[1400px] mx-auto w-full">
        <div className="max-w-[400px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Headquarters</span>
          <p className="mt-6 text-[1.1rem] opacity-80 leading-loose">
            House.no 1-3/1 Sri Rangavaram<br />
            Medchal Mandal, Hyderabad<br />
            Telangana, India, 501401
          </p>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Contact Office</span>
          <p className="mt-6 text-[1.1rem] opacity-80">+91 91771 55542</p>
          <p className="mt-2 font-bold text-cream">contact@spiceveg.in</p>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between text-[10px] tracking-[0.2em] uppercase opacity-50 gap-4">
        <div>© 2026 SPICEVEG AGRI SEEDS PVT LTD</div>
        <div>CIN: U01100TG2022PTC162399 | HYDERABAD</div>
      </div>
    </footer>
  );
};
