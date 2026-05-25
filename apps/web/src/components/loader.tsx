"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Loader — premium cinematic overlay. Plays once on first mount.
 * "Systems initializing organic intelligence."
 */
export const Loader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[3000] bg-[#F7F5EB] flex items-center justify-center overflow-hidden"
        >
          {/* Top + bottom horizontal moving lines */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-0 right-0 h-px bg-ink/40 origin-left"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-0 h-px w-1/3 loader-line"
          />

          {/* Grain texture inside loader */}
          <div className="noise-overlay" style={{ opacity: 0.06 }} />

          <div className="text-center relative z-10 px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono uppercase tracking-[0.4em] text-[10px] text-ink/60 mb-6"
            >
              Initializing
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-3xl md:text-5xl text-ink leading-[0.95]"
            >
              Spice Veg <span className="font-editorial italic">Agri Seeds</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.6 }}
              className="font-hand text-base md:text-lg text-accent-olive mt-5"
            >
              rooted in trust, growing the future.
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 mx-auto h-px bg-ink/30 max-w-[260px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
