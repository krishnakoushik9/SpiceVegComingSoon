"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintModal = ({ isOpen, onClose }: BlueprintModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-forest/98 z-[2000] overflow-y-auto backdrop-blur-2xl text-cream p-4"
        >
          <div 
            onClick={onClose}
            className="fixed top-8 right-8 text-5xl cursor-pointer z-[2001] hover:scale-110 transition-transform"
          >
            ×
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1200px] mx-auto py-16 px-4"
          >
            <h2 className="font-anton uppercase leading-[0.8] tracking-[-0.04em] text-[clamp(3rem,10vw,6rem)] mb-4">
              Growth Blueprint
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-sage">
              Spice Veg Agri Seeds Private Limited • Medchal Malkajgiri Dist – 501401
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
              {/* English Section */}
              <div className="bg-white/5 p-[clamp(2rem,5vw,4rem)] rounded-[4rem] border border-white/10">
                <h3 className="font-serif italic text-4xl mb-8 pb-4 border-b border-white/10">
                  🌶️ Hot Pepper
                </h3>
                
                <div className="space-y-8">
                  <Section title="1. Seed Rate" content="80–100 g per acre" />
                  <Section title="2. Climate & Soil" content="Well-drained black to medium clay-loamy soil is ideal. Avoid water stagnation." />
                  <Section title="3. Sowing Time & Method" content="Regional timing selection. Nursery raising and transplanting recommended. Spacing: 60 x 45 cm (Row × Plant)." />
                  <Section title="4. Nursery Management" content="Damping-off control: Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ): 2 g/litre drench. Carbendazim 50% WP (Bavistin): 1 g/litre drench." />
                  <Section title="5. Nutrient Management" content="1st Dose (10–12 days): 30:50:30 NPK kg/acre. 2nd & 3rd Dose (20–25 days): 25:50:25 NPK kg/acre. At Flowering: Sulphur (Bensulph) 10 kg/acre. Spray Calcium Nitrate 1% solution." />
                </div>
              </div>

              {/* Telugu Section */}
              <div className="bg-white/5 p-[clamp(2rem,5vw,4rem)] rounded-[4rem] border border-white/10">
                <h3 className="font-serif italic text-4xl mb-8 pb-4 border-b border-white/10 font-sans not-italic">
                  🌶️ మిరపకాయ సాగు
                </h3>
                
                <div className="space-y-8">
                  <Section title="1. విత్తన పరిమాణం" content="ఎకరానికి 80–100 గ్రాముల విత్తనాలు అవసరం" />
                  <Section title="2. వాతావరణం & నేల" content="మంచి డ్రైనేజీ ఉన్న నల్ల మరియు మధ్య మట్టి నేలలు అనుకూలం. నీరు నిల్వ ఉండకూడదు." />
                  <Section title="3. విత్తే సమయం & విధానం" content="ప్రాంతానుసారం సరైన సమయం. నర్సరీ పెంచి మార్పిడి (Transplanting) చేయడం మంచిది. దూరం: 60 x 45 సెం.మీ." />
                  <Section title="4. నర్సరీ నిర్వహణ" content="డాంపింగ్ ఆఫ్ నియంత్రణ: మెటాలాక్సిల్ 8% + మాంకోజెబ్ 64% (2 గ్రా/లీ) లేదా కార్బెండాజిమ్ 50% (1 గ్రా/లీ)." />
                  <Section title="5. పోషక నిర్వహణ" content="మొదటి మోతాదు: 30:50:30 NPK. పుష్ప దశలో: సల్ఫర్ 10 కిలోలు. కాల్షియం నైట్రేట్ 1% స్ప్రే." />
                </div>
              </div>
            </div>

            <div className="mt-16 text-center opacity-60 text-[11px]">
              <p>⚠️ Disclaimer: Recommendations based on research observations. Results vary by climate and management.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="space-y-2">
    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-sage">{title}</h4>
    <p className="text-base opacity-90 leading-relaxed">{content}</p>
  </div>
);
