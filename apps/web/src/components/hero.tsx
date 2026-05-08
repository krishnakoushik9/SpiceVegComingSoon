"use client";
import React from "react";
import { motion } from "framer-motion";

export const Hero = () => {
  const title = "SPICEVEG";
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      }
    },
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-sage relative overflow-hidden text-center px-[5vw]">
      <div 
        className="absolute inset-0 w-[110%] h-[110%] bg-[url('/GPTFARMER.png')] bg-cover bg-center opacity-40 mix-blend-multiply" 
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-6 text-forest/70 z-10"
      >
        Advancing Horticultural Science
      </motion.div>
      
      <motion.h1 
        variants={container}
        initial="hidden"
        animate="show"
        className="text-[clamp(4rem,20vw,24rem)] font-anton uppercase leading-[0.8] tracking-[-0.04em] text-forest/90 z-10 relative flex overflow-hidden"
      >
        {title.split("").map((char, index) => (
          <motion.span key={index} variants={item}>
            {char}
          </motion.span>
        ))}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="font-serif italic text-[clamp(1.2rem,7vw,5rem)] z-10 -mt-4"
      >
        Agri Seeds
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="font-handwritten text-[clamp(2rem,4vw,3rem)] text-moss mt-10 z-10"
      >
        Cultivating excellence in every field
      </motion.div>
    </div>
  );
};
