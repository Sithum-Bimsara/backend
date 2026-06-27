import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";

interface Props {
  value: string; // "HH:mm" 24h format
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

const CustomTimePicker: React.FC<Props> = ({ value, onChange, label, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert "HH:mm" to { hour, minute, ampm }
  const timeState = useMemo(() => {
    if (!value) return { hour: 12, minute: 0, ampm: "AM" as const };
    const [h, m] = value.split(":").map(Number);
    const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return { hour, minute: m, ampm };
  }, [value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
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
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeChange = (h: number, m: number, ap: "AM" | "PM") => {
    let finalHour = ap === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    const formatted = `${finalHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    onChange(formatted);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...

  const DropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: `${coords.top + 8}px`,
        left: `${coords.left}px`,
        width: "280px", // Fixed width for the picker
      }}
      className="z-[9999] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex gap-4">
        {/* Hours */}
        <div className="flex-1 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Hour</span>
          <div className="h-48 overflow-y-auto no-scrollbar space-y-1 py-1">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => handleTimeChange(h, timeState.minute, timeState.ampm)}
                className={`w-full py-2 rounded-xl text-sm font-black transition-all ${
                  timeState.hour === h ? "bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {h.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Minutes */}
        <div className="flex-1 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Min</span>
          <div className="h-48 overflow-y-auto no-scrollbar space-y-1 py-1">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => handleTimeChange(timeState.hour, m, timeState.ampm)}
                className={`w-full py-2 rounded-xl text-sm font-black transition-all ${
                  timeState.minute === m ? "bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* AM/PM */}
        <div className="flex flex-col gap-2 pt-6">
          {(["AM", "PM"] as const).map((ap) => (
            <button
              key={ap}
              onClick={() => handleTimeChange(timeState.hour, timeState.minute, ap)}
              className={`px-4 py-3 rounded-xl text-xs font-black transition-all ${
                timeState.ampm === ap ? "bg-[#0e2a47] text-white shadow-lg shadow-[#0e2a47]/20" : "bg-slate-50 text-slate-400 hover:text-slate-600"
              }`}
            >
              {ap}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5 md:space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 md:h-12 px-4 md:px-2 rounded-lg border flex items-center justify-between bg-white transition-all ${
          isOpen ? "border-[#2dd4af] ring-4 ring-[#2dd4af]/10" : "border-slate-200 hover:border-[#2dd4af]/30"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Clock className={`w-4 h-4 ${isOpen ? "text-[#2dd4af]" : "text-slate-400"}`} />
          <span className="text-[9px] md:text-[11px] font-black text-[#0e2a47] whitespace-nowrap">
            {timeState.hour.toString().padStart(2, '0')}:{timeState.minute.toString().padStart(2, '0')} {timeState.ampm}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(DropdownContent, document.body)}
    </div>
  );
};

export default CustomTimePicker;
