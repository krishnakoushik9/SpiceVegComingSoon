"use client";
import React, { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ContentSection } from "@/components/content-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { BlueprintModal } from "@/components/blueprint-modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="min-h-screen bg-cream selection:bg-forest selection:text-cream">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-forest origin-left z-[1001]"
        style={{ scaleX }}
      />

      <Navbar onOpenBlueprint={() => setIsModalOpen(true)} />
      
      <Hero />
      
      <ContentSection />
      
      <CTASection onOpenBlueprint={() => setIsModalOpen(true)} />
      
      <Footer />

      <BlueprintModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
