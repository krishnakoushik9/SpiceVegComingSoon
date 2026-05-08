"use client";
import React from "react";
import { motion } from "framer-motion";

interface NavbarProps {
  onOpenBlueprint: () => void;
}

export const Navbar = ({ onOpenBlueprint }: NavbarProps) => {
  return (
    <nav className="fixed top-0 w-full p-4 md:p-10 flex justify-between items-center z-[1000]">
      <div className="font-anton text-2xl mix-blend-difference text-white">SPICEVEG</div>
      <button 
        onClick={onOpenBlueprint}
        className="bg-forest/10 backdrop-blur-md px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-forest/20 cursor-pointer transition-all duration-400 hover:bg-forest hover:text-white"
      >
        Growth Blueprint
      </button>
    </nav>
  );
};
