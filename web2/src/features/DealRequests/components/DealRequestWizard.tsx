import React from 'react';
import { useDealRequestForm } from '../hooks/useDealRequestForm';
import { DESTINATION_OPTIONS } from '../../../constants/islands';
import { CustomDatePicker } from '../../../components/Common/CustomDatePicker';
import CustomSelect from '../../../components/Common/CustomSelect';

type DealRequestWizardProps = {
  showIntro?: boolean;
  compact?: boolean;
  showInlineSuccess?: boolean;
  onSuccess?: (message: string) => void;
};

type BudgetOption = {
  label: string;
  value: string;
};

const destinationOptions = DESTINATION_OPTIONS;

const budgetOptions: BudgetOption[] = [
  { label: '$500 - $1,000', value: '$500 - $1,000' },
  { label: '$1,000 - $3,000', value: '$1,000 - $3,000' },
  { label: '$3,000 - $5,000', value: '$3,000 - $5,000' },
  { label: '$5,000+', value: '$5,000+' },
];

const travelerTypes = ['Solo', 'Couple', 'Family', 'Friends', 'Work Colleagues'];
const preferenceOptions = [
  'Sunset Cruising',
  'Manta Snorkeling',
  'Whale Shark Snorkeling',
  'Nurse Shark Snorkeling',
  'Turtle Snorkeling',
  'Scuba Diving',
  'Beach BBQ',
  'Island Hopping',
  'Dolphin Watching',
  'Sandbank Picnic',
];
const accommodationOptions = ['Hotel', 'Resort', 'Villa', 'Any'];

const DealRequestWizard: React.FC<DealRequestWizardProps> = ({
  showIntro = true,
  compact = false,
  showInlineSuccess = true,
  onSuccess,
}) => {
  const {
    watchedValues,
    currentStep,
    progressPercent,
    currentStepLabel,
    steps,
    submitting,
    success,
    submitError,
    authLoading,
    user,
    actions: {
      goNext,
      goBack,
      setCurrentStep,
      handleReset,
      togglePreference,
      onSubmit,
      updateField,
    },
  } = useDealRequestForm({
    showInlineSuccess,
    onSuccess,
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: {
        const selectOptions = destinationOptions.map((dest) => ({
          value: dest,
          label: dest,
        }));
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-medium text-cyan-900">
              Destination Country: <span className="font-bold">Maldives</span>
            </div>

            <CustomSelect
              label="City / Island / Atoll"
              placeholder="Select destination"
              options={selectOptions}
              value={watchedValues.destination || null}
              onChange={(val) => updateField('destination', val)}
              searchable
              size={compact ? 'sm' : 'md'}
            />
          </div>
        );
      }
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2 pb-44 sm:pb-0">
            <CustomDatePicker
              label="Start Date"
              value={watchedValues.startDate}
              onChange={(date) => updateField('startDate', date)}
              placeholder="Select start date"
              minDate={new Date().toISOString().split('T')[0]}
              compact={compact}
            />
            <CustomDatePicker
              label="End Date"
              value={watchedValues.endDate}
              onChange={(date) => updateField('endDate', date)}
              placeholder="Select end date"
              minDate={watchedValues.startDate || new Date().toISOString().split('T')[0]}
              compact={compact}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className={compact ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'}>
              {budgetOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateField('budget', option.value)}
                  className={`border text-left font-semibold transition-all ${
                    compact ? 'rounded-xl px-3 py-2.5 text-xs' : 'rounded-2xl px-4 py-4 text-sm'
                  } ${
                    watchedValues.budget === option.value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`border border-slate-200 bg-white ${compact ? 'rounded-xl p-2.5' : 'rounded-2xl p-4'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold text-slate-900 ${compact ? 'text-xs' : 'text-sm'}`}>Adults</p>
                    <p className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>16+ years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('adults', Math.max(1, watchedValues.adults - 1))}
                      className="h-8 w-8 rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold text-slate-900">{watchedValues.adults}</span>
                    <button
                      type="button"
                      onClick={() => updateField('adults', watchedValues.adults + 1)}
                      className="h-8 w-8 rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className={`border border-slate-200 bg-white ${compact ? 'rounded-xl p-2.5' : 'rounded-2xl p-4'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold text-slate-900 ${compact ? 'text-xs' : 'text-sm'}`}>Children</p>
                    <p className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>0-15 years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('children', Math.max(0, watchedValues.children - 1))}
                      className="h-8 w-8 rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold text-slate-900">{watchedValues.children}</span>
                    <button
                      type="button"
                      onClick={() => updateField('children', watchedValues.children + 1)}
                      className="h-8 w-8 rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
              <label className="text-xs font-semibold text-slate-600">Travel group</label>
              <div className={`grid grid-cols-2 md:grid-cols-3 ${compact ? 'gap-2' : 'gap-3'}`}>
                {travelerTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('travelerType', type)}
                    className={`border font-semibold transition-all ${
                      compact ? 'rounded-xl px-3 py-2 text-xs' : 'rounded-2xl px-4 py-3 text-sm'
                    } ${
                      watchedValues.travelerType === type
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={compact ? 'space-y-2' : 'space-y-3'}>
            <label className="text-xs font-semibold text-slate-600">Choose your preferences</label>
            <div className={`flex flex-wrap ${compact ? 'gap-2' : 'gap-3'}`}>
              {preferenceOptions.map((preference) => {
                const selected = (watchedValues.preferences || []).includes(preference);
                return (
                  <button
                    type="button"
                    key={preference}
                    onClick={() => togglePreference(preference)}
                    className={`rounded-full border font-semibold transition-all ${
                      compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    } ${
                      selected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50'
                    }`}
                  >
                    {preference}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className={compact ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'}>
            {accommodationOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => updateField('accommodationType', option)}
                className={`border text-left font-semibold transition-all ${
                  compact ? 'rounded-xl px-3 py-2.5 text-xs' : 'rounded-2xl px-4 py-4 text-sm'
                } ${
                  watchedValues.accommodationType === option
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
            <label className="text-xs font-semibold text-slate-600">Additional requests</label>
            <textarea
              value={watchedValues.additionalRequests}
              onChange={(event) => updateField('additionalRequests', event.target.value)}
              placeholder="Anything else we should know? Optional: transfers, meals, activities, accessibility, etc."
              rows={compact ? 3 : 6}
              className={`w-full rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
              }`}
            />
          </div>
        );
      default:
        return (
          <div className={compact ? 'space-y-3' : 'space-y-6'}>
            <div className={compact ? 'grid gap-3 md:grid-cols-[1.2fr_0.8fr]' : 'grid gap-4 md:grid-cols-[1.2fr_0.8fr]'}>
              <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
                <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                <input
                  value={watchedValues.contactNumber}
                  onChange={(event) => updateField('contactNumber', event.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  className={`w-full rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                  }`}
                  placeholder="Your phone number"
                  required
                />
              </div>
              <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
                <label className="text-xs font-semibold text-slate-600">Requester</label>
                <input
                  value={user?.name || user?.email || ''}
                  disabled
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-550 ${
                    compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                  }`}
                />
              </div>
            </div>

            <div className={`border border-slate-200 bg-slate-50 ${compact ? 'rounded-xl p-3' : 'rounded-2xl p-5'}`}>
              <dl className={`text-slate-700 ${compact ? 'space-y-1.5 text-xs' : 'space-y-3 text-sm'}`}>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Destination</dt>
                  <dd className="font-medium text-slate-900">Maldives - {watchedValues.destination || 'Not specified'}</dd>
                </div>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Dates</dt>
                  <dd className="font-medium text-slate-900">{watchedValues.startDate} to {watchedValues.endDate}</dd>
                </div>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Budget</dt>
                  <dd className="font-medium text-slate-900">{watchedValues.budget}</dd>
                </div>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Travelers</dt>
                  <dd className="font-medium text-slate-900">{watchedValues.adults} adults, {watchedValues.children} children, {watchedValues.travelerType}</dd>
                </div>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Preferences</dt>
                  <dd className="font-medium text-slate-900 text-right">{(watchedValues.preferences || []).join(', ')}</dd>
                </div>
                <div className={`flex justify-between gap-4 border-b border-slate-200/70 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <dt>Accommodation</dt>
                  <dd className="font-medium text-slate-900">{watchedValues.accommodationType}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Extra notes</dt>
                  <dd className="font-medium text-slate-900 text-right">{watchedValues.additionalRequests || 'None'}</dd>
                </div>
              </dl>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
      {showIntro && (
        <div className={`bg-linear-to-r from-cyan-500 to-blue-600 text-white ${compact ? 'px-5 py-5' : 'px-6 py-7'}`}>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-50/90 font-semibold">Need a custom package?</p>
          <h1 className={`${compact ? 'mt-1 text-xl md:text-2xl' : 'mt-2 text-2xl md:text-3xl'} font-bold`}>Request a Deal</h1>
          <p className={`mt-2 max-w-2xl text-sm text-cyan-50/90 ${compact ? 'hidden md:block' : ''}`}>Build your trip step by step and we’ll prepare a tailored travel deal for you.</p>
        </div>
      )}

      <div className={compact ? 'p-4 md:p-5' : 'p-5 md:p-7'}>
        {authLoading ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : !user ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
            You need to sign in first to submit a deal request.
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className={compact ? 'space-y-3' : 'space-y-6'}
          >
            <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
              <div className={`flex items-center justify-between gap-3 ${compact ? 'flex-col items-start md:flex-row md:items-center pr-10 md:pr-12' : ''}`}>
                <div>
                  <p className={`font-semibold uppercase text-cyan-600 ${compact ? 'text-[10px] tracking-[0.14em]' : 'text-xs tracking-[0.24em]'}`}>Step {currentStep + 1} of {steps.length}</p>
                  <h2 className={`mt-0.5 font-bold text-slate-900 ${compact ? 'text-sm md:text-base' : 'text-lg'}`}>{currentStepLabel}</h2>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-lime-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                className={`hidden md:flex gap-2 overflow-x-auto pb-1 pr-1 ${
                  !compact ? 'md:grid md:grid-cols-4 xl:grid-cols-8' : ''
                }`}
              >
                {steps.map((step, index) => {
                  const active = index === currentStep;
                  const completed = index < currentStep;
                  return (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      key={step.key}
                      className={`rounded-2xl border text-center transition-all ${compact ? 'min-w-22 px-2 py-2' : 'px-3 py-3'} ${
                        active
                          ? 'border-lime-500 bg-lime-50 text-lime-800'
                          : completed
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      <div className={`mx-auto ${compact ? 'mb-1 h-6 w-6' : 'mb-2 h-7 w-7'} flex items-center justify-center rounded-full text-xs font-bold ${active || completed ? 'bg-white/90' : 'bg-slate-100'}`}>
                        {index + 1}
                      </div>
                      <p className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-semibold leading-tight`}>{step.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div key={currentStep} className={`${compact ? 'h-[20.5rem] overflow-y-auto sm:h-auto sm:overflow-visible sm:min-h-[17.5rem]' : 'min-h-48 md:min-h-70'} animate-in fade-in slide-in-from-right-2 duration-200`}>
              {renderStepContent()}
            </div>

            {submitError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div>}

            {compact ? (
              /* Compact (modal) nav — always a single row */
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentStep === 0 || submitting}
                  aria-label="Back"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.93" />
                  </svg>
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2dd4af] py-2.5 text-sm font-semibold text-[#0e2a47] shadow-md shadow-[#2dd4af]/25 transition-all hover:bg-[#25b898] active:scale-[0.98]"
                  >
                    Continue
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !!success}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2dd4af] py-2.5 text-sm font-semibold text-[#0e2a47] shadow-md shadow-[#2dd4af]/25 transition-all hover:bg-[#25b898] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting…' : success ? 'Submitted ✓' : 'Submit Request'}
                  </button>
                )}
              </div>
            ) : (
              /* Full (page) nav */
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentStep === 0 || submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Reset
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-xl bg-[#2dd4af] px-5 py-2.5 text-sm font-semibold text-[#fdfdfd] shadow-lg shadow-[#2dd4af]/20 transition-all hover:scale-[1.01] hover:bg-[#25b898] hover:shadow-xl hover:shadow-[#2dd4af]/30"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !!success}
                      className="rounded-xl bg-[#2dd4af] px-5 py-2.5 text-sm font-semibold text-[#0e2a47] shadow-lg shadow-[#2dd4af]/20 transition-all hover:scale-[1.01] hover:bg-[#25b898] hover:shadow-xl hover:shadow-[#2dd4af]/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : success ? 'Request Submitted ✓' : 'Submit Request'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DealRequestWizard;
