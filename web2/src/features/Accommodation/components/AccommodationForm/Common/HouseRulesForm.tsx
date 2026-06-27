import CustomSelect from "../../../../../components/Common/CustomSelect";
import CustomTimePicker from "../../../../../components/Common/CustomTimePicker";
import type { HouseRulesDto } from "../../../dtos/accommodation.dto";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: HouseRulesDto;
  onChange: (value: HouseRulesDto) => void;
  disabled?: boolean;
}

const HouseRulesForm: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="House-Rules" 
        description="Set your property's ground rules, including check-in/out times and basic guest policies."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Check-in/out Card */}
        <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-[#2dd4af] text-white flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h3 className="text-xs md:text-sm font-bold text-slate-900">Check-in / Out</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <CustomTimePicker
                label="Check-in From"
                disabled={disabled}
                value={value.checkInFrom ?? "14:00"}
                onChange={(time) => onChange({ ...value, checkInFrom: time })}
              />
              <CustomTimePicker
                label="Check-in Until"
                disabled={disabled}
                value={value.checkInTo ?? "20:00"}
                onChange={(time) => onChange({ ...value, checkInTo: time })}
              />
            </div>
            <div className="space-y-4">
              <CustomTimePicker
                label="Check-out From"
                disabled={disabled}
                value={value.checkOutFrom ?? "08:00"}
                onChange={(time) => onChange({ ...value, checkOutFrom: time })}
              />
              <CustomTimePicker
                label="Check-out Until"
                disabled={disabled}
                value={value.checkOutTo ?? "11:00"}
                onChange={(time) => onChange({ ...value, checkOutTo: time })}
              />
            </div>
          </div>
        </div>

        {/* Toggles Card */}
        <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 md:space-y-4">
          {[
            { label: "Smoking Allowed", key: "smokingAllowed" as const },
            { label: "Children Allowed", key: "childrenAllowed" as const },
            { label: "Parties Allowed", key: "partiesAllowed" as const },
          ].map((rule) => (
            <button
              key={rule.key}
              disabled={disabled}
              type="button"
              onClick={() => onChange({ ...value, [rule.key]: !value[rule.key] })}
              className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl bg-white border border-slate-100 hover:border-[#2dd4af]/30 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs md:text-sm font-bold text-slate-900">{rule.label}</span>
              <div 
                className={`h-5 w-5 md:h-6 md:w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  value[rule.key] ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
                }`}
              >
                {value[rule.key] && <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </button>
          ))}
          
          <div className="pt-2 space-y-3 md:space-y-4">
              <CustomSelect
                disabled={disabled}
                label="Pets Policy"
                value={value.petsPolicy.mode}
                onChange={(mode) => onChange({ ...value, petsPolicy: { ...value.petsPolicy, mode: mode as HouseRulesDto["petsPolicy"]["mode"] } })}
                options={[
                  { value: "yes", label: "Allowed" },
                  { value: "request", label: "By request" },
                  { value: "no", label: "Not allowed" },
                ]}
              />
            
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Pet Fees Policy</label>
              <input
                disabled={disabled}
                type="text"
                value={value.petFeesPolicy.amount}
                onChange={(e) => onChange({ ...value, petFeesPolicy: { amount: e.target.value } })}
                placeholder="Describe any pet fees"
                className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseRulesForm;
