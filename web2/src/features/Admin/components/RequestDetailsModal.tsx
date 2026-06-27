import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "./AdminUI";
import type { DealRequestStatus } from "../types/admin.types";

interface ParsedRequestMessage {
  summary: string;
  parsedFields: Array<{ label: string; value: string }>;
  freeformNotes: string[];
}

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ParsedRequestMessage & {
    name: string;
    email: string;
    createdAt: string;
    contactNumber: string | null;
    status: DealRequestStatus;
    id: string;
  } | null;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ isOpen, onClose, item }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => setVisible(true), 10);
    return () => {
      window.clearTimeout(timer);
      setVisible(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const leftHighlightFields = item.parsedFields.slice(0, 4);
  const rightStructuredFields = item.parsedFields.slice(4);

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-start justify-center overflow-y-auto px-2 py-4 transition-all duration-300 md:px-4 md:items-center ${visible ? "bg-slate-950/60 backdrop-blur-sm" : "bg-slate-950/0 backdrop-blur-0"}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-4xl md:rounded-4xl bg-white shadow-[0_32px_90px_rgba(15,23,42,0.3)] transition-all duration-300 max-h-[calc(100vh-2rem)] flex flex-col ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:translate-y-0 md:scale-95"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-4 md:px-8 md:py-6 shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Deal Request Details</div>
            <h3 className="mt-1 text-xl md:text-3xl font-bold text-slate-900 truncate tracking-tight">{item.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-slate-500 font-medium">
              <span className="truncate">{item.email}</span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95"
            aria-label="Close request details"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto pb-6">
          <div className="grid items-start gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-4 py-5 md:px-8 md:py-8">
              <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50/50 to-white p-5 md:p-7 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v10H7l-3 3V4z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer message</div>
                    <p className="mt-2.5 whitespace-pre-wrap wrap-break-word text-[15px] md:text-lg font-medium leading-relaxed md:leading-8 text-slate-800">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                  <Badge tone={item.status === "new" ? "yellow" : item.status === "contacted" ? "indigo" : "gray"}>{item.status}</Badge>
                  <Badge tone="gray">{new Date(item.createdAt).toLocaleDateString()}</Badge>
                  {item.contactNumber && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-100">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12.92.32 1.82.59 2.69a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.39-1.23a2 2 0 0 1 2.11-.45c.87.27 1.77.47 2.69.59A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {item.contactNumber}
                    </div>
                  )}
                </div>

                {item.parsedFields.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Key highlights</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {leftHighlightFields.map((field) => (
                        <div key={`left-${field.label}-${field.value}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{field.label}</div>
                          <div className="text-[13px] md:text-sm font-bold text-slate-800 leading-tight wrap-break-word">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.freeformNotes.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Additional notes</div>
                    <div className="space-y-3">
                      {item.freeformNotes.map((note, noteIndex) => (
                        <div key={`${note}-${noteIndex}`} className="rounded-2xl border border-amber-100 bg-amber-50/50 px-5 py-4 text-sm leading-relaxed text-slate-700 wrap-break-word font-medium">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-8 lg:px-8 lg:py-8 lg:border-l lg:border-slate-100 bg-slate-50/30">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Structured details</div>
              <div className="grid grid-cols-1 gap-3">
                {rightStructuredFields.length > 0 ? (
                  rightStructuredFields.map((field) => (
                    <React.Fragment key={`${field.label}-${field.value}`}>
                      <div className="rounded-2xl border border-indigo-100/50 bg-white px-4 py-3.5 shadow-xs">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1">{field.label}</div>
                        <div className="text-[13px] md:text-sm font-bold text-slate-800 leading-tight wrap-break-word">{field.value}</div>
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white/50 px-5 py-6 text-sm text-slate-400 text-center font-medium italic">
                    Already included in highlights.
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">Request Metadata</div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400 font-medium font-sans">Contact No</span>
                    <span className="font-bold text-slate-800 wrap-break-word">{item.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400 font-medium font-sans">Current Status</span>
                    <Badge tone={item.status === "new" ? "yellow" : item.status === "contacted" ? "indigo" : "gray"}>{item.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400 font-medium font-sans">Received On</span>
                    <span className="font-bold text-slate-800">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
