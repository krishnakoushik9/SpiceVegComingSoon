"use client";
import React, { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Hero } from "@/components/hero";
import { PhilosophySection } from "@/components/philosophy-section";
import { ShowcaseSection } from "@/components/showcase-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { BlueprintModal } from "@/components/blueprint-modal";
import { Loader } from "@/components/loader";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <main className="min-h-screen bg-bg-primary text-ink overflow-hidden">
      <Loader />

      {/* Cinematic scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-ink/80 origin-left z-[1001]"
        style={{ scaleX }}
      />

      <Hero />
      <PhilosophySection />
      <ShowcaseSection />
      <CTASection onOpenBlueprint={() => setIsModalOpen(true)} />
      <Footer />

      <BlueprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
