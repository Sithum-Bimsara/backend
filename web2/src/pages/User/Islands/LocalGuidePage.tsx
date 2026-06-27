import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Globe, Gem, Compass, Palmtree, Utensils, ChevronRight, ChevronLeft, Sparkles, Map } from 'lucide-react';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import { ONBOARDING_ACTIVITY_OPTIONS } from '../../../features/Deals/constants/deal-taxonomy';

const CATEGORY_OPTIONS = [
  { value: 'near_airport', label: 'Near Airport', icon: Plane, desc: 'Quick transit, less travel time', color: 'text-amber-500 border-amber-500/20' },
  { value: 'local_island', label: 'Local Islands', icon: Globe, desc: 'Immersive cultural experience', color: 'text-emerald-600 border-emerald-500/20' },
  { value: 'luxury_seaplane', label: 'Luxury & Seaplanes', icon: Gem, desc: 'Premium resort getaways', color: 'text-pink-600 border-pink-500/20' },
  { value: 'marine_life_focus', label: 'Marine Life Focus', icon: Compass, desc: 'Abundant house reefs & dive zones', color: 'text-cyan-600 border-cyan-500/20' },
  { value: 'scenic_beaches', label: 'Scenic Beaches', icon: Palmtree, desc: 'Pure white sands & turquoise lagoons', color: 'text-teal-600 border-teal-500/20' },
  { value: 'food_and_culture', label: 'Food & Culture', icon: Utensils, desc: 'Taste traditional Maldivian cuisines', color: 'text-orange-600 border-orange-500/20' },
];

const LocalGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleToggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const handleToggleActivity = (value: string) => {
    setSelectedActivities(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const handleBuildGuide = () => {
    const cats = selectedCategories.join(',');
    const acts = selectedActivities.join(',');
    navigate(`/local-guide/results?categories=${cats}&activities=${acts}`);
  };

  return (
    <div className="min-h-screen bg-(--app-bg) text-slate-800">
      <SEO 
        title="LushWare | Local Guide Planner"
        description="Plan your customized Maldivian trip. Select your vacation preferences and match with the perfect islands."
      />

      <PageHeader 
        title="Local Island"
        highlightedWord="Guide"
        description="Select your favorite vibes and activities to unlock your custom-tailored Maldives island guide."
        backgroundImage="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop"
      />

      <main className="max-w-6xl mx-auto px-6 py-16 relative">
        {/* Background micro glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Step progress header */}
        <div className="flex items-center justify-between mb-12 bg-white border border-black/5 rounded-3xl p-6 relative z-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2dd4af]/10 border border-[#2dd4af]/20 flex items-center justify-center text-[#25b898] font-bold">
              {step}
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47]">
                {step === 1 ? 'Step 1: Choose Your Vibe' : 'Step 2: Choose Your Activities'}
              </h2>
              <p className="text-sm text-slate-400">
                {step === 1 ? 'What type of islands do you prefer?' : 'What do you plan to do in the Maldives?'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 1 ? 'bg-[#2dd4af] scale-125' : 'bg-slate-200'}`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 2 ? 'bg-[#2dd4af] scale-125' : 'bg-slate-200'}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {CATEGORY_OPTIONS.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <motion.div
                      key={cat.value}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleCategory(cat.value)}
                      className={`cursor-pointer group relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-[180px] ${
                        isSelected 
                          ? 'bg-[#2dd4af]/5 border-[#2dd4af] shadow-[0_0_20px_rgba(45,212,175,0.12)]' 
                          : 'bg-white border-black/5 hover:border-black/15 shadow-[0_4px_20px_rgb(0,0,0,0.01)]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl border ${isSelected ? 'bg-[#2dd4af]/10 border-[#2dd4af]/30' : 'bg-slate-50 border-black/5'} ${cat.color}`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#2dd4af] text-white flex items-center justify-center text-xs font-bold font-mono">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0e2a47] group-hover:text-[#25b898] transition-colors">{cat.label}</h3>
                        <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate('/local-guide/islands')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0e2a47] border border-black/5 shadow-sm font-medium text-sm transition-all cursor-pointer"
                >
                  <Map className="w-4 h-4 text-slate-400" />
                  See All Islands
                </button>

                <button
                  onClick={() => setStep(2)}
                  disabled={selectedCategories.length === 0}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer ${
                    selectedCategories.length > 0
                      ? 'bg-[#0e2a47] text-white hover:bg-[#153457] shadow-[#0e2a47]/10 hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="flex flex-wrap gap-4 justify-center py-6 mb-12">
                {ONBOARDING_ACTIVITY_OPTIONS.map((act) => {
                  const isSelected = selectedActivities.includes(act.value);
                  return (
                    <motion.button
                      key={act.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleActivity(act.value)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2dd4af]/10 border-[#2dd4af] text-[#25b898] shadow-[0_0_15px_rgba(45,212,175,0.1)]'
                          : 'bg-white border-black/5 text-[#0e2a47] hover:border-black/15 hover:bg-slate-50/50 shadow-sm'
                      }`}
                    >
                      <span className="text-lg">{act.icon}</span>
                      <span>{act.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0e2a47] border border-black/5 shadow-sm font-medium text-sm transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={handleBuildGuide}
                  disabled={selectedActivities.length === 0}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer ${
                    selectedActivities.length > 0
                      ? 'bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] shadow-[#2dd4af]/20 hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Build My Guide
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LocalGuidePage;
