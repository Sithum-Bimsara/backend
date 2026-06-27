import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AdminPageShell,
  AdminCard,
  Badge,
} from "../../../features/Admin/components/AdminUI";
import { useIslandForm } from "../../../features/Islands/hooks/useIslandForm";
import { ONBOARDING_ACTIVITY_OPTIONS } from "../../../features/Deals/constants/deal-taxonomy";
import IslandSelect from "../../../components/IslandSelect";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { uploadPropertyImageToStorage } from "../../../features/Accommodation/utils/property-image-upload";
import CustomTimePicker from "../../../components/Common/CustomTimePicker";

const CATEGORY_OPTIONS = [
  { value: "near_airport", label: "Near Airport", desc: "Quick transit, less travel time" },
  { value: "local_island", label: "Local Islands", desc: "Immersive cultural experience" },
  { value: "luxury_seaplane", label: "Luxury & Seaplanes", desc: "Premium resort getaways" },
  { value: "marine_life_focus", label: "Marine Life Focus", desc: "Abundant house reefs & dive zones" },
  { value: "scenic_beaches", label: "Scenic Beaches", desc: "Pure white sands & turquoise lagoons" },
  { value: "food_and_culture", label: "Food & Culture", desc: "Taste traditional Maldivian cuisines" },
];

const MARINE_LIFE_OPTIONS = [
  {
    id: "House Reef",
    label: "House Reef",
    description: "Direct access to vibrant corals and colorful fish right from the island.",
  },
  {
    id: "Turtle Spot",
    label: "Turtle Spot",
    description: "Known area for observing sea turtles in their natural habitat.",
  },
  {
    id: "Dolphin Zone",
    label: "Dolphin Zone",
    description: "Prime location for dolphin sightings and boat excursions.",
  },
  {
    id: "Sandbank",
    label: "Sandbank",
    description: "Pristine white sandbars surrounded by crystal clear turquoise waters.",
  },
  {
    id: "Manta Point",
    label: "Manta Point",
    description: "Famous cleaning stations for majestic Manta Rays.",
  },
  {
    id: "Shark Point",
    label: "Shark Point",
    description: "Safe areas to spot baby reef sharks or whale sharks seasonally.",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const format24hTo12h = (timeStr: string) => {
  if (!timeStr) return "";
  if (!timeStr.includes(":")) return timeStr;
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const AdminCreateIsland: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const form = useIslandForm(id);

  const {
    steps,
    currentStep,
    draft,
    loading,
    fetching,
    error,
    patchDraft,
    handleNext,
    handleBack,
    handleReset,
    handleSubmit,
  } = form;

  // Local helper state for raw array items in step forms
  const [newTip, setNewTip] = useState("");
  const [newSampleTime, setNewSampleTime] = useState("08:00");
  const [newSampleDesc, setNewSampleDesc] = useState("");
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodDesc, setNewFoodDesc] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState<number | "">("");
  const [foodDealError, setFoodDealError] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const [transferDropdownOpen, setTransferDropdownOpen] = useState(false);
  const [uploadingBySlot, setUploadingBySlot] = useState<Record<number, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (slotIdx: number, file: File | null) => {
    if (!file) return;
    setUploadingBySlot((prev) => ({ ...prev, [slotIdx]: true }));
    setUploadError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image exceeds the 10MB limit.");
      }
      const uploadedUrl = await uploadPropertyImageToStorage(file);
      const nextImages = [...(draft.images || [])];
      if (slotIdx < nextImages.length) {
        nextImages[slotIdx] = uploadedUrl;
      } else {
        nextImages.push(uploadedUrl);
      }
      patchDraft({ images: nextImages });
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image.");
    } finally {
      setUploadingBySlot((prev) => ({ ...prev, [slotIdx]: false }));
    }
  };

  const handleImageRemove = (slotIdx: number) => {
    const nextImages = draft.images.filter((_, idx) => idx !== slotIdx);
    patchDraft({ images: nextImages });
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading island details...</p>
      </div>
    );
  }

  // Category toggles
  const handleToggleCategory = (value: string) => {
    const categories = draft.categories.includes(value)
      ? draft.categories.filter((c) => c !== value)
      : [...draft.categories, value];
    patchDraft({ categories });
  };

  // Activity toggles
  const handleToggleActivity = (value: string) => {
    const activities = draft.activities.includes(value)
      ? draft.activities.filter((a) => a !== value)
      : [...draft.activities, value];
    patchDraft({ activities });
  };

  // Marine Life Highlights toggles
  const handleToggleMarineLifeZone = (value: string) => {
    const marineLifeZones = draft.marineLifeZones.includes(value)
      ? draft.marineLifeZones.filter((z) => z !== value)
      : [...draft.marineLifeZones, value];
    patchDraft({ marineLifeZones });
  };

  // Dynamic Array Handlers - Insider Tips
  const handleAddTip = () => {
    if (!newTip.trim()) {
      setTipError("Please enter an insider tip before adding.");
      return;
    }
    setTipError(null);
    patchDraft({ insiderTips: [...(draft.insiderTips || []), newTip.trim()] });
    setNewTip("");
  };

  const handleRemoveTip = (index: number) => {
    patchDraft({
      insiderTips: draft.insiderTips.filter((_, idx) => idx !== index),
    });
  };

  // Dynamic Array Handlers - Sample Day Timeline
  const handleAddSampleDay = () => {
    if (!newSampleDesc.trim()) {
      setTimelineError("Please enter a description for the timeline node.");
      return;
    }
    setTimelineError(null);
    patchDraft({
      sampleDay: [
        ...(draft.sampleDay || []),
        { time: newSampleTime.trim(), description: newSampleDesc.trim() },
      ],
    });
    setNewSampleTime("08:00");
    setNewSampleDesc("");
  };

  const handleRemoveSampleDay = (index: number) => {
    patchDraft({
      sampleDay: draft.sampleDay?.filter((_, idx) => idx !== index) || [],
    });
  };

  // Dynamic Array Handlers - Food Deals
  const handleAddFoodDeal = () => {
    if (!newFoodName.trim()) {
      setFoodDealError("Please enter a food or drink name.");
      return;
    }
    if (!newFoodDesc.trim()) {
      setFoodDealError("Please enter a description or ingredients.");
      return;
    }
    if (newFoodPrice === "") {
      setFoodDealError("Please enter an estimated price.");
      return;
    }
    if (Number(newFoodPrice) < 0) {
      setFoodDealError("Please enter a valid estimated price (greater than or equal to 0).");
      return;
    }
    setFoodDealError(null);
    patchDraft({
      foodAndDrinkDeals: [
        ...(draft.foodAndDrinkDeals || []),
        {
          name: newFoodName.trim(),
          description: newFoodDesc.trim(),
          price: Number(newFoodPrice),
        },
      ],
    });
    setNewFoodName("");
    setNewFoodDesc("");
    setNewFoodPrice("");
  };

  const handleRemoveFoodDeal = (index: number) => {
    patchDraft({
      foodAndDrinkDeals:
        draft.foodAndDrinkDeals?.filter((_, idx) => idx !== index) || [],
    });
  };

  // Dynamic Array Handlers for images moved to slot uploader above

  // Month condition changer
  const handleMonthConditionChange = (
    monthIdx: number,
    condition: "excellent" | "good" | "fair" | "avoid"
  ) => {
    const updated = [...draft.bestTimeMonths];
    updated[monthIdx] = condition;
    patchDraft({ bestTimeMonths: updated as any });
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <AdminPageShell
      title={id ? "Edit Island Details" : "Create Maldives Island"}
      subtitle={id ? `Update guide profiles for ${draft.name}` : "Build a beautiful profile for a local island guide"}
      actions={
        <div className="flex items-center gap-2">
          {!id && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 text-slate-600 bg-white text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Clear Draft
            </button>
          )}
          <button
            onClick={() => navigate("/admin/islands")}
            className="px-4 py-2 border border-slate-200 text-slate-600 bg-white text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Wizard Header Navigation Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Progress: Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {steps[currentStep]}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-full border-r border-white last:border-0 transition-all duration-300 ${
                  idx <= currentStep ? "bg-indigo-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <AdminCard className="p-6 md:p-8">
          <FormErrorBanner error={error} />
          {/* Step 0: Basic Info & Vibe */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                Basic Info & Vibe Description
              </h3>

              <div className="space-y-2">
                <IslandSelect
                  label="Island Name *"
                  placeholder="Select Island"
                  searchable={true}
                  value={draft.name || null}
                  onChange={(name) => patchDraft({ name })}
                  valueFormat="name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Island Vibes / Categories (At least one)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = draft.categories.includes(cat.value);
                    return (
                      <div
                        key={cat.value}
                        onClick={() => handleToggleCategory(cat.value)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-indigo-500/5 border-indigo-500 shadow-sm"
                            : "bg-slate-50 border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            {cat.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Overview Intro
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the overall culture, location size, geographical aspects, and what makes it unique..."
                  value={draft.overview}
                  onChange={(e) => patchDraft({ overview: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Best For Summary (Short Pitch)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Budget families seeking house-reef snorkeling and turtle beaches."
                  value={draft.bestFor}
                  onChange={(e) => patchDraft({ bestFor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Step 1: Activities & Wildlife */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                Activities & Wildlife Zones
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Associated Activities (At least one)
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ONBOARDING_ACTIVITY_OPTIONS.map((act) => {
                    const isSelected = draft.activities.includes(act.value);
                    return (
                      <button
                        key={act.value}
                        type="button"
                        onClick={() => handleToggleActivity(act.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{act.icon}</span>
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Marine Life Zones Highlights (At least one)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {MARINE_LIFE_OPTIONS.map((zone) => {
                    const isSelected = draft.marineLifeZones.includes(zone.id);
                    return (
                      <div
                        key={zone.id}
                        onClick={() => handleToggleMarineLifeZone(zone.id)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-indigo-500/5 border-indigo-500 shadow-sm"
                            : "bg-slate-50 border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            {zone.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {zone.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nightlife & Social Scene
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention beach BBQs, live Maldivian cultural drums (Bodu Beru), floating bars, or local cafe spots..."
                  value={draft.nightlife}
                  onChange={(e) => patchDraft({ nightlife: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Step 2: Practical Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                Practical Travel Guidance
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Safety & Local Customs
                </label>
                <textarea
                  rows={3}
                  placeholder="Bikini beaches, conservative attire codes on local streets, alcohol regulations, and security metrics..."
                  value={draft.safetyText}
                  onChange={(e) => patchDraft({ safetyText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Internet & Remote Work Status
                </label>
                <textarea
                  rows={3}
                  placeholder="Co-working cafes, average Dhiraagu/Ooredoo 4G/5G speeds, guest house WiFi reliability..."
                  value={draft.internetText}
                  onChange={(e) => patchDraft({ internetText: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Transfer Details / Modes *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTransferDropdownOpen(!transferDropdownOpen)}
                    className="w-full flex items-center justify-between h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all text-sm font-medium"
                  >
                    <span className={draft.transferDetails.length > 0 ? "text-slate-900" : "text-slate-400"}>
                      {draft.transferDetails.length > 0
                        ? draft.transferDetails.join(", ")
                        : "Select Transfer Modes"}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                        transferDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {transferDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setTransferDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 mt-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 space-y-1">
                        {["Speedboat", "Seaplane", "Domestic Flight"].map((mode) => {
                          const isSelected = draft.transferDetails.includes(mode);
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                const transferDetails = draft.transferDetails.includes(mode)
                                  ? draft.transferDetails.filter((t) => t !== mode)
                                  : [...draft.transferDetails, mode];
                                patchDraft({ transferDetails });
                              }}
                              className="w-full p-2.5 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-all text-left text-xs md:text-sm font-medium text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>{mode}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Best Time Calendar */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                12-Month Monsoonal Weather & Peak Calendar
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Click/Select Monsoonal Condition for each month:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {MONTHS.map((monthName, idx) => {
                    const condition = draft.bestTimeMonths[idx];
                    let borderClass = "border-slate-200";
                    let bgClass = "bg-slate-50";

                    if (condition === "excellent") {
                      borderClass = "border-emerald-500";
                      bgClass = "bg-emerald-50 text-emerald-800";
                    } else if (condition === "good") {
                      borderClass = "border-teal-500";
                      bgClass = "bg-teal-50 text-teal-800";
                    } else if (condition === "fair") {
                      borderClass = "border-amber-500";
                      bgClass = "bg-amber-50 text-amber-800";
                    } else if (condition === "avoid") {
                      borderClass = "border-rose-500";
                      bgClass = "bg-rose-50 text-rose-800";
                    }

                    return (
                      <div
                        key={monthName}
                        className={`p-3 rounded-2xl border transition-all ${borderClass} ${bgClass}`}
                      >
                        <div className="text-xs font-bold mb-2 text-slate-800">
                          {monthName}
                        </div>
                        <select
                          value={condition}
                          onChange={(e) =>
                            handleMonthConditionChange(
                              idx,
                              e.target.value as any
                            )
                          }
                          className="w-full bg-white text-slate-800 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="excellent">Excellent ☀️</option>
                          <option value="good">Good ⛅</option>
                          <option value="fair">Fair 🌦️</option>
                          <option value="avoid">Avoid ⛈️</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Best Time Text Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. December to April (Dry Season)"
                    value={draft.bestTimeTextBest || ""}
                    onChange={(e) =>
                      patchDraft({ bestTimeTextBest: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Months to Avoid Text Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June to August (Heavy Monsoons)"
                    value={draft.bestTimeTextAvoid || ""}
                    onChange={(e) =>
                      patchDraft({ bestTimeTextAvoid: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Monsoon Weather Advice Tips
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plankton is high in May, ideal for manta ray sightseeing but less underwater visibility."
                  value={draft.bestTimeTextTips || ""}
                  onChange={(e) =>
                    patchDraft({ bestTimeTextTips: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Step 4: Financial Breakdown */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                Financial Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Stay Price (Local Residents) - $
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 45"
                    value={draft.costLocal === 0 ? "" : draft.costLocal}
                    onChange={(e) =>
                      patchDraft({ costLocal: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center px-1">
                    <span>Typical range: $30 - $75 per night</span>
                  </p>
                  {Number(draft.costLocal) > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Local Currency</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ≈ {(Number(draft.costLocal) * 15.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MVR
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Stay Price (Foreign Tourists) - $
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 95"
                    value={draft.costNonLocal === 0 ? "" : draft.costNonLocal}
                    onChange={(e) =>
                      patchDraft({ costNonLocal: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center px-1">
                    <span>Typical range: $80 - $250 per night</span>
                  </p>
                  {Number(draft.costNonLocal) > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Local Currency</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ≈ {(Number(draft.costNonLocal) * 15.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MVR
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Average Food & Drinks Cost - $
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={draft.costFoodDrinks === 0 ? "" : draft.costFoodDrinks}
                    onChange={(e) =>
                      patchDraft({ costFoodDrinks: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center px-1">
                    <span>Typical range: $15 - $40 per day</span>
                  </p>
                  {Number(draft.costFoodDrinks) > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Local Currency</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ≈ {(Number(draft.costFoodDrinks) * 15.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MVR
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Average Activities Cost - $
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={draft.costActivities === 0 ? "" : draft.costActivities}
                    onChange={(e) =>
                      patchDraft({ costActivities: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center px-1">
                    <span>Typical range: $20 - $100 per excursion</span>
                  </p>
                  {Number(draft.costActivities) > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Local Currency</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ≈ {(Number(draft.costActivities) * 15.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MVR
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Extra Fees (Taxes/Green Tax) - $
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 6"
                    value={draft.costExtra === 0 ? "" : draft.costExtra}
                    onChange={(e) =>
                      patchDraft({ costExtra: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center px-1">
                    <span>Standard Green Tax is usually $3 - $6 per night</span>
                  </p>
                  {Number(draft.costExtra) > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl animate-in slide-in-from-top-1 fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">Local Currency</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ≈ {(Number(draft.costExtra) * 15.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MVR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: High-res Imagery */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                High-res Imagery
              </h3>
              <p className="text-xs text-slate-500">
                Upload JPG, PNG, or WEBP. Max size 10MB each. Min 1 image required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {Array.from({ length: 4 }).map((_, index) => {
                  const image = draft.images[index];
                  const isUploading = uploadingBySlot[index];

                  return (
                    <div key={index} className="space-y-2">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                         {index === 0 ? "Main Photo *" : `Photo ${index + 1}`}
                       </label>
                      
                      <div className={`group relative aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden bg-slate-50 flex items-center justify-center ${
                        image ? "border-slate-200 shadow-sm" : "border-slate-200 hover:border-indigo-500/50"
                      }`}>
                        {image ? (
                          <>
                            <img
                              src={image}
                              alt={`Island ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as any).src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop";
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-25" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {isUploading && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                              </svg>
                              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Uploading</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => void handleImageUpload(index, e.target.files?.[0] ?? null)}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <div className={`w-full inline-flex justify-center items-center h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            image ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                          }`}>
                            {image ? "Replace" : "Upload"}
                          </div>
                        </label>

                        {image && (
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            className="h-9 px-3 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {uploadError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Custom Timelines & Food Deals */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                  Fine Tuning: Timeline, Deals & Insider Tips
                </h3>
              </div>

              {/* Sample Day Timeline Subform */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Interactive Sample Day Timeline (Optional)
                  </label>
                  <Badge tone="gray">
                    {draft.sampleDay?.length || 0} Slots Saved
                  </Badge>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <CustomTimePicker
                        value={newSampleTime}
                        onChange={(val) => setNewSampleTime(val)}
                        label="Select Time"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5 md:space-y-2">
                      <label className="text-[10px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Timeline Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Scuba tour to dive site, dinner at beachside cafe"
                        value={newSampleDesc}
                        onChange={(e) => {
                          setNewSampleDesc(e.target.value);
                          if (timelineError) setTimelineError(null);
                        }}
                        className={`w-full h-10 md:h-12 px-3 border rounded-lg bg-white text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                          timelineError ? "border-rose-300 ring-2 ring-rose-500/10 focus:ring-rose-500" : "border-slate-200 hover:border-indigo-500/30"
                        }`}
                      />
                    </div>
                  </div>
                  {timelineError && (
                    <div className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-100/80 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{timelineError}</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddSampleDay}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Timeline Node
                    </button>
                  </div>
                </div>

                {draft.sampleDay && draft.sampleDay.length > 0 && (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {draft.sampleDay.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 text-xs bg-white hover:bg-slate-50/50"
                      >
                        <div className="flex gap-4">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {format24hTo12h(item.time)}
                          </span>
                          <span className="text-slate-700">
                            {item.description}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSampleDay(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Food & Drink Specialties Subform */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Local Food & Drinks Specialties (Optional)
                  </label>
                  <Badge tone="gray">
                    {draft.foodAndDrinkDeals?.length || 0} Items Saved
                  </Badge>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Dish/Drink Name (e.g. Mas Huni)"
                      value={newFoodName}
                      onChange={(e) => {
                        setNewFoodName(e.target.value);
                        if (foodDealError) setFoodDealError(null);
                      }}
                      className={`px-3 py-2 border rounded-xl bg-white text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                        foodDealError && !newFoodName.trim() ? "border-rose-300 ring-2 ring-rose-500/10 focus:ring-rose-500" : "border-slate-200"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Ingredients or description specialties..."
                      value={newFoodDesc}
                      onChange={(e) => {
                        setNewFoodDesc(e.target.value);
                        if (foodDealError) setFoodDealError(null);
                      }}
                      className={`sm:col-span-2 px-3 py-2 border rounded-xl bg-white text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                        foodDealError && !newFoodDesc.trim() ? "border-rose-300 ring-2 ring-rose-500/10 focus:ring-rose-500" : "border-slate-200"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Est. Price ($)"
                      value={newFoodPrice}
                      onChange={(e) => {
                        setNewFoodPrice(e.target.value === "" ? "" : Number(e.target.value));
                        if (foodDealError) setFoodDealError(null);
                      }}
                      className={`px-3 py-2 border rounded-xl bg-white text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                        foodDealError && (newFoodPrice === "" || Number(newFoodPrice) < 0) ? "border-rose-300 ring-2 ring-rose-500/10 focus:ring-rose-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {foodDealError && (
                    <div className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-100/80 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{foodDealError}</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddFoodDeal}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Food Item
                    </button>
                  </div>
                </div>

                {draft.foodAndDrinkDeals &&
                  draft.foodAndDrinkDeals.length > 0 && (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {draft.foodAndDrinkDeals.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 text-xs bg-white hover:bg-slate-50/50"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="font-bold text-slate-900">
                              {item.name}
                            </span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-slate-600 truncate max-w-sm inline-block align-middle">
                              {item.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              ${item.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFoodDeal(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Insider Tips Subform */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Insider Secrets & Tips (Optional)
                  </label>
                  <Badge tone="gray">
                    {draft.insiderTips?.length || 0} Tips Saved
                  </Badge>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Try to arrive at ferry terminal 30 min before schedule, ask hosts to pack reef-safe sunscreen..."
                      value={newTip}
                      onChange={(e) => {
                        setNewTip(e.target.value);
                        if (tipError) setTipError(null);
                      }}
                      className={`flex-1 h-10 md:h-12 px-4 border rounded-xl bg-white text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${
                        tipError ? "border-rose-300 ring-2 ring-rose-500/10 focus:ring-rose-500" : "border-slate-200 hover:border-indigo-500/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddTip}
                      className="inline-flex items-center gap-1.5 h-10 md:h-12 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Tip
                    </button>
                  </div>
                  {tipError && (
                    <div className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-100/80 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{tipError}</span>
                    </div>
                  )}
                </div>

                {draft.insiderTips && draft.insiderTips.length > 0 && (
                  <div className="space-y-2">
                    {draft.insiderTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs text-slate-700 font-medium"
                      >
                        <div className="flex gap-2">
                          <span className="font-bold text-indigo-500">
                            ★
                          </span>
                          <span>{tip}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTip(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-4"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                currentStep === 0 || loading
                  ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              Back
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Submitting..." : id ? "Update Island Guide" : "Publish Island Guide"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Next Step
              </button>
            )}
          </div>
        </AdminCard>
      </div>
    </AdminPageShell>
  );
};

export default AdminCreateIsland;
