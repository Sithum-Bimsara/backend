import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  render?: (option: SelectOption) => React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  searchable = false,
  className = "",
  error,
  disabled = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpwards: false });

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownMaxHeight = window.innerWidth >= 768 ? 320 : viewportHeight * 0.7;
      
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Open upwards if not enough space below AND more space above
      const openUpwards = spaceBelow < dropdownMaxHeight + 20 && spaceAbove > spaceBelow;

      setCoords({
        top: openUpwards ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        openUpwards,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById("select-portal");
        if (portal && portal.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-all outline-none bg-white
          ${size === 'sm' ? 'h-7 md:h-8 px-2 md:px-3 rounded-lg border text-[10px] md:text-xs' : 'h-10 md:h-12 px-4 md:px-5 rounded-xl border'}
          ${isOpen ? "border-[#2dd4af] ring-4 ring-[#2dd4af]/5" : "border-slate-200 hover:border-slate-300"}
          ${error ? "border-red-500" : ""}
          ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden text-left">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-lg">{selectedOption.icon}</span>
          )}
          <span className={`text-xs md:text-sm font-medium truncate ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {error && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div id="select-portal" className="fixed inset-0 z-[9999] pointer-events-none">
              {/* Mobile Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm md:hidden pointer-events-auto"
              />

              {/* Dropdown Content */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: coords.openUpwards ? -10 : 10, 
                  scale: 0.95 
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1 
                }}
                exit={{ 
                  opacity: 0, 
                  y: coords.openUpwards ? -10 : 10, 
                  scale: 0.95 
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  top: window.innerWidth >= 768 
                    ? (coords.openUpwards ? undefined : coords.top + 8) 
                    : undefined,
                  bottom: window.innerWidth >= 768 
                    ? (coords.openUpwards ? (window.innerHeight - coords.top + 8) : undefined)
                    : undefined,
                  left: window.innerWidth >= 768 ? coords.left : undefined,
                  width: window.innerWidth >= 768 ? coords.width : undefined,
                }}
                className={`
                  fixed inset-x-4 bottom-8 md:bottom-auto
                  bg-white rounded-2xl md:rounded-xl shadow-2xl border border-slate-100 overflow-hidden
                  flex flex-col max-h-[70vh] md:max-h-[320px] pointer-events-auto z-[10000]
                `}
              >
                {searchable && (
                  <div className="p-3 md:p-2 border-b border-slate-50 sticky top-0 bg-white z-10">
                    <div className="relative">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-lg text-xs md:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#2dd4af]/20 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <button
                        key={`${option.value}-${index}`}
                        onClick={() => handleSelect(option.value)}
                        className={`
                          w-full p-3 md:p-2.5 rounded-lg flex items-center gap-3 transition-all text-left
                          ${option.value === value 
                            ? "bg-[#2dd4af]/10 text-[#2dd4af]" 
                            : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}
                        `}
                      >
                        {option.render ? (
                          option.render(option)
                        ) : (
                          <>
                            {option.icon && (
                              <span className="flex-shrink-0 text-lg">{option.icon}</span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs md:text-sm font-bold truncate">{option.label}</span>
                              {option.description && (
                                <span className="text-[10px] md:text-xs opacity-60 truncate">{option.description}</span>
                              )}
                            </div>
                            {option.value === value && (
                              <svg viewBox="0 0 24 24" className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <p className="text-xs md:text-sm text-slate-400 font-medium italic">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
