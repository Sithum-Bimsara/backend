import React, { useState } from "react";
import type { HostProfileDto } from "../../../dtos/accommodation.dto";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: HostProfileDto;
  onChange: (value: HostProfileDto) => void;
  disabled?: boolean;
}

const HostProfileForm: React.FC<Props> = ({ value, onChange, disabled }) => {
  const sections = [
    {
      key: "propertyDescription",
      label: "The property",
      title: "About the property",
      placeholder: "What makes your place unique? What can guests expect?",
    },
    {
      key: "hostDescription",
      label: "The host",
      title: "About you or your team",
      placeholder: "Share a little about who will be welcoming guests.",
    },
    {
      key: "neighborhoodDescription",
      label: "The neighborhood",
      title: "About the neighborhood",
      placeholder: "Tell guests what is nearby and what they should know about the area.",
    },
  ] as const;

  const [manuallyOpened, setManuallyOpened] = useState<Partial<Record<(typeof sections)[number]["key"], boolean>>>({});

  const getValue = (key: (typeof sections)[number]["key"]): string => {
    return value[key] || '';
  };

  const isSectionOpen = (key: (typeof sections)[number]["key"]) => {
    return Boolean(getValue(key)) || Boolean(manuallyOpened[key]);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Host Profile" 
        description="Choose which parts of your profile you want guests to see and add the details below. Personal touches help build trust with guests."
      />

      <div className="space-y-3">
        {sections.map((section) => {
          return (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#2dd4af]/30">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
                <input
                  disabled={disabled}
                  type="checkbox"
                  checked={isSectionOpen(section.key)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setManuallyOpened((current) => ({ ...current, [section.key]: checked }));
                    if (!checked) {
                      onChange({ ...value, [section.key]: "" } as HostProfileDto);
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-[#2dd4af] focus:ring-[#2dd4af] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={disabled ? "text-slate-500" : ""}>{section.label}</span>
              </label>

              {isSectionOpen(section.key) && (
                <div className="mt-3 md:mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">{section.title}</span>
                    <span className="text-[10px] md:text-xs text-slate-400">{getValue(section.key).length} chars</span>
                  </div>
                  <textarea
                    disabled={disabled}
                    rows={3}
                    value={getValue(section.key)}
                    placeholder={section.placeholder}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2dd4af]/20 focus:border-[#2dd4af] disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition-all"
                    onChange={(event) => onChange({ ...value, [section.key]: event.target.value } as HostProfileDto) }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={() => {
            setManuallyOpened({});
            onChange({
              propertyDescription: "",
              hostDescription: "",
              neighborhoodDescription: "",
            });
          }}
          className="text-sm font-medium text-[#0e2a47] underline decoration-[#2dd4af] decoration-2 underline-offset-4"
        >
          None of the above / I'll add these later
        </button>
      )}
      {!disabled && !isSectionOpen("propertyDescription") && !isSectionOpen("hostDescription") && !isSectionOpen("neighborhoodDescription") && <p className="text-sm text-slate-500">You can skip this for now and come back later.</p>}
    </div>
  );
};

export default HostProfileForm;
