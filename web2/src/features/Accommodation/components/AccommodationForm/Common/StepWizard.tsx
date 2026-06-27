import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PropertyStep } from "../../../types/accommodation.types";

interface Props {
  steps: PropertyStep[];
  currentStep: number;
}

const labels: Record<PropertyStep, string> = {
  type: "Property Type",
  unit_type: "Unit Type",
  location: "Location",
  details: "Property Details",
  facilities: "Facilities",
  nearby: "Nearby",
  "marine-life": "Marine Life",
  "house-rules": "House Rules",
  languages: "Languages",
  "host-profile": "Host Profile",
  beds: "Bed Configuration",
  bathrooms: "Bathrooms",
  pricing: "Pricing",
  "child-pricing": "Child Pricing",
  cancellation: "Cancellation Policy",
  units: "Units",
  images: "Images",
  final: "Finish",
  amenities: "Amenities",
};

const StepWizard: React.FC<Props> = ({ steps, currentStep }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-scroll the active step into view on desktop
  useEffect(() => {
    const activeElement = scrollRef.current?.querySelector(`[data-step="${currentStep}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [currentStep]);

  return (
    <div className="w-full space-y-4">
      {/* Mobile Version: Compact Progress & Current Step */}
      <div className="md:hidden bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-5 w-10 rounded-full bg-[#2dd4af]/10 text-[#2dd4af] text-[10px] font-bold uppercase tracking-wider">
                Step {currentStep + 1}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                of {steps.length}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {labels[steps[currentStep]]}
            </h3>
          </div>
          
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="h-full w-full absolute -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-50"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-[#2dd4af]"
                initial={{ strokeDasharray: "150", strokeDashoffset: "150" }}
                animate={{ strokeDashoffset: 150 - (150 * (currentStep + 1)) / steps.length }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </svg>
            <span className="text-[11px] font-bold text-slate-900">{Math.round(progress)}%</span>
          </div>
        </div>
        
        {/* Progress Bar with markers */}
        <div className="relative pt-2">
          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-[#2dd4af] to-[#2dd4af]/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Version: Horizontal Scrollable Timeline */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex items-center gap-0 p-3 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div 
                key={step} 
                data-step={index}
                className="shrink-0 flex items-center"
              >
                <div className="flex flex-col items-center gap-1 px-4 group cursor-default">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          layoutId="active-ring"
                          className="absolute -inset-1 rounded-full border-2 border-[#2dd4af]/20"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: isActive ? 1.05 : 1,
                        backgroundColor: isActive || isComplete ? "#2dd4af" : "#f1f5f9"
                      }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                        isActive || isComplete ? "text-white" : "text-slate-400"
                      } ${isActive ? "shadow-md shadow-[#2dd4af]/20" : ""}`}
                    >
                      {isComplete ? (
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </motion.div>
                  </div>
                  
                  <span 
                    className={`text-[9px] font-bold whitespace-nowrap transition-all duration-300 uppercase tracking-tight ${
                      isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {labels[step]}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-slate-100 relative -mt-5">
                    <motion.div 
                      className="absolute inset-0 bg-[#2dd4af]"
                      initial={false}
                      animate={{ width: isComplete ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepWizard;

