import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type CustomDatePickerProps = {
  value: string; // expects YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  compact?: boolean;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate = '',
  maxDate = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  // Local navigation state for the calendar view month and year
  const initialDate = value ? new Date(value) : new Date();
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync calendar view month/year when the value prop changes externally
  useEffect(() => {
    if (value) {
      const frame = requestAnimationFrame(() => {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          setViewMonth(d.getMonth());
          setViewYear(d.getFullYear());
        }
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [value]);

  // Click outside listener to close the datepicker popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateDropdownPosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = Math.min(rect.width, viewportWidth - 16);
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = compact ? 278 : 320;
      const openUpwards = spaceBelow < dropdownHeight + 16 && rect.top > spaceBelow;
      const left = Math.max(8, Math.min(rect.left, viewportWidth - dropdownWidth - 8));

      setDropdownStyle({
        position: 'fixed',
        top: openUpwards ? undefined : rect.bottom + 8,
        bottom: openUpwards ? viewportHeight - rect.top + 8 : undefined,
        left,
        width: dropdownWidth,
        zIndex: 10000,
      });
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, compact]);

  // Helper: Format Date object to YYYY-MM-DD string locally
  const formatDateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Format standard YYYY-MM-DD to display-friendly format (e.g. MM/DD/YYYY)
  const getDisplayValue = (): string => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
    }
    return value;
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number, offsetMonth: number) => {
    let targetMonth = viewMonth + offsetMonth;
    let targetYear = viewYear;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    const selectedDate = new Date(targetYear, targetMonth, day);
    onChange(formatDateString(selectedDate));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDateString(today));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // Generate date grid cells
  const cells: { day: number; isCurrentMonth: boolean; offsetMonth: number }[] = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      offsetMonth: -1,
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      offsetMonth: 0,
    });
  }

  // Leading days from next month to make full weeks
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      offsetMonth: 1,
    });
  }

  // Check if a day cell is selected
  const isSelected = (day: number, offsetMonth: number): boolean => {
    if (!value) return false;
    const currentViewDate = new Date(viewYear, viewMonth + offsetMonth, day);
    return value === formatDateString(currentViewDate);
  };

  // Check if a day cell is disabled under minDate/maxDate
  const isDisabled = (day: number, offsetMonth: number): boolean => {
    const currentViewDate = new Date(viewYear, viewMonth + offsetMonth, day);
    currentViewDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const minD = new Date(minDate);
      minD.setHours(0, 0, 0, 0);
      if (currentViewDate < minD) return true;
    }

    if (maxDate) {
      const maxD = new Date(maxDate);
      maxD.setHours(0, 0, 0, 0);
      if (currentViewDate > maxD) return true;
    }

    return false;
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
          {label}
        </label>
      )}

      {/* Date display button/input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white font-medium text-slate-700 shadow-xs transition-all hover:border-cyan-300 hover:bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
        }`}
      >
        <span className={getDisplayValue() ? 'text-slate-900' : 'text-slate-400 font-normal'}>
          {getDisplayValue() || placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-slate-400 transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Custom Calendar Popover */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={`rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-100/90 animate-in fade-in slide-in-from-top-1.5 duration-200 ${
            compact ? 'p-2.5' : 'p-3.5'
          }`}
        >
          {/* Header with Month/Year Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className={`font-bold text-[#0e2a47] ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekdays Grid */}
          <div className={`grid grid-cols-7 text-center font-bold uppercase tracking-wider text-slate-400 ${
            compact ? 'gap-0.5 mt-1 text-[9px]' : 'gap-1 mt-2 text-[10px]'
          }`}>
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className={`grid grid-cols-7 text-center ${compact ? 'gap-0.5 mt-0.5' : 'gap-1 mt-1'}`}>
            {cells.map((cell, index) => {
              const selected = isSelected(cell.day, cell.offsetMonth);
              const disabled = isDisabled(cell.day, cell.offsetMonth);

              return (
                <button
                  type="button"
                  key={index}
                  disabled={disabled}
                  onClick={() => handleSelectDay(cell.day, cell.offsetMonth)}
                  className={`flex items-center justify-center rounded-full font-bold transition-all relative ${
                    compact ? 'h-6 w-6 text-[10px]' : 'h-7 w-7 text-[11px]'
                  } ${
                    selected
                      ? 'bg-[#2dd4af] text-[#0e2a47] shadow-sm shadow-[#2dd4af]/35'
                      : disabled
                        ? 'text-slate-200 cursor-not-allowed opacity-35'
                        : cell.isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                          : 'text-slate-350 hover:bg-slate-50/50 cursor-pointer'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className={`flex items-center justify-between border-t border-slate-100 ${
            compact ? 'pt-1.5 mt-1.5' : 'pt-2.5 mt-2.5'
          }`}>
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
