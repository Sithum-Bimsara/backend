import React, { useState } from "react";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

const CORE_LANGUAGES = ["Arabic", "English", "Dhivehi", "Hindi", "French", "German", "Chinese", "Spanish"];
const ADDITIONAL_LANGUAGES = [
  "Afrikaans", "Albanian", "Amharic", "Armenian", "Azerbaijani", "Bengali", "Bosnian", "Bulgarian", 
  "Catalan", "Croatian", "Czech", "Danish", "Dutch", "Estonian", "Filipino", "Finnish", "Georgian", 
  "Greek", "Gujarati", "Hebrew", "Hungarian", "Icelandic", "Indonesian", "Italian", "Japanese", 
  "Kannada", "Kazakh", "Khmer", "Korean", "Lao", "Latvian", "Lithuanian", "Macedonian", "Malay", 
  "Malayalam", "Marathi", "Mongolian", "Nepali", "Norwegian", "Persian", "Polish", "Portuguese", 
  "Punjabi", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian", "Swahili", "Swedish", 
  "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek", "Vietnamese"
].sort();

interface Props {
  value: string[];
  onChange: (languages: string[]) => void;
}

const LanguagesSelector: React.FC<Props> = ({ value, onChange }) => {
  const [showAdditional, setShowAdditional] = useState(false);

  const toggleLanguage = (language: string) => {
    const active = value.includes(language);
    onChange(active ? value.filter((item) => item !== language) : [...value, language]);
  };

  const renderLanguageItem = (language: string) => {
    const active = value.includes(language);
    return (
      <button
        key={language}
        type="button"
        onClick={() => toggleLanguage(language)}
        className={`flex items-center gap-2 md:gap-3 w-full text-left p-2 md:p-3 rounded-xl border transition-all duration-200 ${
          active 
            ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" 
            : "border-slate-100 bg-white hover:border-[#2dd4af]/30"
        }`}
      >
        <div className={`h-5 w-5 md:h-6 md:w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
          active ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200"
        }`}>
          {active && (
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span className={`text-[10px] md:text-xs font-bold ${active ? "text-slate-900" : "text-slate-500"}`}>
          {language}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Languages Spoken" 
        description="Select all the languages that you or your staff can communicate in. This helps in matching with the right guests."
      />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Common Languages</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CORE_LANGUAGES.map(renderLanguageItem)}
          </div>
        </div>

        {!showAdditional ? (
          <button
            type="button"
            onClick={() => setShowAdditional(true)}
            className="text-xs font-bold text-[#2dd4af] hover:underline flex items-center gap-1.5 pt-1"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add additional languages
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">More Languages</div>
              <button 
                type="button" 
                onClick={() => setShowAdditional(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Hide
              </button>
            </div>
            <div className="h-48 overflow-y-auto pr-2 scrollbar-hide border border-slate-100 rounded-xl bg-slate-50/50 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ADDITIONAL_LANGUAGES.filter(lang => !CORE_LANGUAGES.includes(lang)).map(renderLanguageItem)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguagesSelector;
