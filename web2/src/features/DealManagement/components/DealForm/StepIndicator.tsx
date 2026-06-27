import React from 'react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/30'
                    : isComplete
                    ? 'bg-[#2dd4af]/20 text-[#2dd4af]'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isComplete ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline transition-colors ${
                  isActive ? 'text-[#0e2a47]' : isComplete ? 'text-[#2dd4af]' : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-colors ${
                  isComplete ? 'bg-[#2dd4af]/40' : 'bg-slate-100'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
