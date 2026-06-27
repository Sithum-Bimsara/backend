import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { api } from '../../../lib/api';
import {
  ONBOARDING_ACTIVITY_OPTIONS,
  ONBOARDING_ACCOMMODATION_OPTIONS,
} from '../../../features/Deals/constants/deal-taxonomy';
import { ATOLL_OPTIONS } from '../../../constants/islands';

//////////////////////////////////////////////////////
// STEP OPTIONS DATA
//////////////////////////////////////////////////////

const TRAVEL_STYLES = [
  { value: 'luxury', label: 'Luxury Escape', icon: '✨', desc: 'Private villas, premium resorts' },
  { value: 'romantic', label: 'Romantic Getaway', icon: '💑', desc: 'Honeymoon, couples retreat' },
  { value: 'relaxation', label: 'Relaxation', icon: '🏖️', desc: 'Beach, spa, slow living' },
  { value: 'diving', label: 'Diving Adventure', icon: '🤿', desc: 'Reefs, sharks, manta rays' },
  { value: 'budget', label: 'Budget Island Life', icon: '🎒', desc: 'Local islands, guesthouses' },
  { value: 'eco', label: 'Eco & Marine', icon: '🌿', desc: 'Sustainable, conservation' },
];

const LOCATIONS = ATOLL_OPTIONS;

const ACCOMMODATION_TYPES = ONBOARDING_ACCOMMODATION_OPTIONS;

const ACTIVITIES = ONBOARDING_ACTIVITY_OPTIONS;

const TRIP_DURATIONS = [
  { value: 'weekend', label: '2–3 days', desc: 'Quick weekend getaway' },
  { value: 'week', label: '5–7 days', desc: 'Full week vacation' },
  { value: 'two_weeks', label: '10–14 days', desc: 'Extended holiday' },
  { value: 'month', label: '30+ days', desc: 'Long-term travel' },
];

const GROUP_TYPES = [
  { value: 'solo', label: 'Solo', icon: '🧑' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', icon: '👯' },
];

const TRANSFER_TYPES = [
  { value: 'speedboat', label: 'Speedboat', icon: '🚤' },
  { value: 'seaplane', label: 'Seaplane', icon: '🛩️' },
  { value: 'domestic', label: 'Domestic Flight', icon: '✈️' },
];

const DIVER_LEVELS = [
  { value: 'non_diver', label: 'Not a Diver', icon: '🏊', desc: 'No diving experience' },
  { value: 'beginner', label: 'Beginner', icon: '🤿', desc: 'Never dived or recently certified' },
  { value: 'intermediate', label: 'Intermediate', icon: '🐠', desc: 'Comfortable at depth' },
  { value: 'advanced', label: 'Advanced', icon: '🦈', desc: '70+ dives' },
  { value: 'instructor', label: 'Instructor', icon: '👨‍🏫', desc: 'Certified instructor+' },
];

const TOTAL_STEPS = 8;

//////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////

const UserOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Personal info state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);

  // Preferences state
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(100);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([]);
  const [activityInterests, setActivityInterests] = useState<string[]>([]);
  const [diverLevel, setDiverLevel] = useState('');
  const [tripDuration, setTripDuration] = useState('');
  const [travelGroupType, setTravelGroupType] = useState('');
  const [transportPreference, setTransportPreference] = useState<string[]>([]);

  const toggleArray = (arr: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return travelStyle.length > 0;
      case 2: return budgetMin < budgetMax;
      case 3: return preferredLocations.length > 0;
      case 4: return accommodationTypes.length > 0;
      case 5: return activityInterests.length > 0;
      case 6: return diverLevel !== '';
      case 7: return tripDuration !== '' && travelGroupType !== '' && transportPreference.length > 0;
      case 8: return address.trim().length > 0 && city.trim().length > 0 && country !== '';
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save preferences
      await api.post('/user-preferences', {
        travelStyle,
        budgetMin,
        budgetMax,
        preferredLocations,
        accommodationTypes,
        activityInterests,
        diverLevel,
        tripDuration,
        travelGroupType,
        transportPreference: transportPreference.join(','),
      });

      // Update user profile with address info
      await api.patch('/user-profile', {
        address,
        city,
        country,
      });

      await fetchUser();
      navigate('/');
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  // Privacy Modal Component
  const PrivacyModal = () => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${showPrivacyModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => { }} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-2xl font-bold text-[#0e2a47]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your Privacy Matters
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            <strong>Data Protection Notice:</strong> Your personal information is safe with us.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-700">
              ✓ Your data is encrypted and securely stored
            </p>
            <p className="text-sm text-gray-700">
              ✓ We never share your information with third parties
            </p>
            <p className="text-sm text-gray-700">
              ✓ You can update or delete your data anytime
            </p>
            <p className="text-sm text-gray-700">
              ✓ We comply with international privacy regulations
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I acknowledge that I've read and understand the privacy notice
          </span>
        </label>

        <button
          onClick={() => setShowPrivacyModal(false)}
          disabled={!privacyAgreed}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Onboarding
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f] flex flex-col">
      {/* Privacy Modal */}
      {showPrivacyModal && <PrivacyModal />}

      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ opacity: showPrivacyModal ? 0.5 : 1 }}>
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="LushWare" className="h-10 w-auto object-contain" />
        </div>
        <span className="text-white/50 text-xs">{showPrivacyModal ? 'Privacy Notice' : `Step ${step} of ${TOTAL_STEPS}`}</span>
      </div>

      {/* Progress bar */}
      <div className="px-6" style={{ opacity: showPrivacyModal ? 0.5 : 1, pointerEvents: showPrivacyModal ? 'none' : 'auto' }}>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-6 pb-28" style={{ opacity: showPrivacyModal ? 0.5 : 1, pointerEvents: showPrivacyModal ? 'none' : 'auto' }}>
        <div className="w-full max-w-xl mx-auto">
          {/* Step 1: Travel Style */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  What's your travel style?
                </h1>
                <p className="text-white/60 text-sm">Select all that describe your ideal vacation</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAVEL_STYLES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArray(travelStyle, opt.value, setTravelStyle)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${travelStyle.includes(opt.value)
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                      }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <p className="text-white font-semibold text-sm mt-2">{opt.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Set your budget range
                </h1>
                <p className="text-white/60 text-sm">We'll show deals that match your budget</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-8 space-y-8">
                <div className="text-center">
                  <span className="text-4xl font-bold text-emerald-400">${budgetMin}</span>
                  <span className="text-white/40 mx-3">—</span>
                  <span className="text-4xl font-bold text-emerald-400">${budgetMax}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-xs uppercase tracking-wider font-semibold">Minimum</label>
                    <input
                      type="range"
                      min={150}
                      max={10000}
                      step={50}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      className="w-full accent-emerald-400 mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs uppercase tracking-wider font-semibold">Maximum</label>
                    <input
                      type="range"
                      min={50}
                      max={10000}
                      step={50}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full accent-emerald-400 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferred Locations */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Where do you dream of going?
                </h1>
                <p className="text-white/60 text-sm">Pick your favorite destinations</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.value}
                    onClick={() => toggleArray(preferredLocations, loc.value, setPreferredLocations)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${preferredLocations.includes(loc.value)
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <span className="text-3xl">{loc.icon}</span>
                    <span className="text-white text-xs font-semibold">{loc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Accommodation Types */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Where would you like to stay?
                </h1>
                <p className="text-white/60 text-sm">Select your preferred accommodation types</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACCOMMODATION_TYPES.map(acc => (
                  <button
                    key={acc.value}
                    onClick={() => toggleArray(accommodationTypes, acc.value, setAccommodationTypes)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${accommodationTypes.includes(acc.value)
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <span className="text-3xl">{acc.icon}</span>
                    <span className="text-white text-xs font-semibold">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Activities */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  What activities excite you?
                </h1>
                <p className="text-white/60 text-sm">We'll personalize your feed with relevant deals</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACTIVITIES.map(act => (
                  <button
                    key={act.value}
                    onClick={() => toggleArray(activityInterests, act.value, setActivityInterests)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${activityInterests.includes(act.value)
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                  >
                    <span className="text-2xl">{act.icon}</span>
                    <span className="text-white text-xs font-semibold text-center">{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Diver Level */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  What's your diving experience?
                </h1>
                <p className="text-white/60 text-sm">Help us recommend the perfect diving experiences</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIVER_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setDiverLevel(level.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${diverLevel === level.value
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                      }`}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <p className="text-white font-semibold text-sm mt-2">{level.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{level.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Trip Duration & Group & Transfer */}
          {step === 7 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Almost there!
                </h1>
                <p className="text-white/60 text-sm">Just a couple more details</p>
              </div>

              {/* Trip Duration */}
              <div>
                <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">Preferred trip duration</h3>
                <div className="grid grid-cols-2 gap-3">
                  {TRIP_DURATIONS.map(dur => (
                    <button
                      key={dur.value}
                      onClick={() => setTripDuration(dur.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${tripDuration === dur.value
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <p className="text-white font-semibold text-sm">{dur.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{dur.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Type */}
              <div>
                <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">Who do you travel with?</h3>
                <div className="flex flex-wrap gap-3">
                  {GROUP_TYPES.map(grp => (
                    <button
                      key={grp.value}
                      onClick={() => setTravelGroupType(grp.value)}
                      className={`px-5 py-3 rounded-full border-2 flex items-center gap-2 transition-all duration-200 ${travelGroupType === grp.value
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <span className="text-lg">{grp.icon}</span>
                      <span className="text-white text-sm font-medium">{grp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transfer Type */}
              <div>
                <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">
                  Preferred transfer (select one or more)
                </h3>

                <div className="flex flex-wrap gap-3">
                  {TRANSFER_TYPES.map(tr => (
                    <button
                      key={tr.value}
                      onClick={() => toggleArray(transportPreference, tr.value, setTransportPreference)}
                      className={`px-5 py-3 rounded-full border-2 flex items-center gap-2 transition-all duration-200 ${transportPreference.includes(tr.value)
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <span className="text-lg">{tr.icon}</span>
                      <span className="text-white text-sm font-medium">{tr.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {/* Step 8: Address Information */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Where are you based?
                </h1>
                <p className="text-white/60 text-sm">Help us tailor your experience with local context</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-8 space-y-5">
                <div className="space-y-1.5 text-left">
                  <label className="text-white/80 text-xs font-semibold uppercase tracking-wider">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a3a5a] border border-white/20 text-white focus:outline-none focus:border-emerald-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-white/40">Select your country</option>
                    {[
                      'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
                      'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
                      'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
                      'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
                      'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
                      'Fiji', 'Finland', 'France',
                      'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guyana',
                      'Haiti', 'Honduras', 'Hungary',
                      'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
                      'Jamaica', 'Japan', 'Jordan',
                      'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
                      'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
                      'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
                      'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
                      'Oman',
                      'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
                      'Qatar',
                      'Romania', 'Russia', 'Rwanda',
                      'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
                      'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
                      'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
                      'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
                      'Yemen',
                      'Zambia', 'Zimbabwe'
                    ].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-white/80 text-xs font-semibold uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      placeholder="e.g. London"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-white/80 text-xs font-semibold uppercase tracking-wider">Address</label>
                    <input
                      type="text"
                      placeholder="Street, area, etc."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                {/* Professional Context Message */}
                <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 flex gap-3 mt-4">
                  <div className="text-emerald-400 text-xl shrink-0">✨</div>
                  <div className="text-left">
                    <p className="text-emerald-50 text-sm font-semibold mb-1">Personalized Deal Recommendations</p>
                    <p className="text-emerald-100/70 text-xs leading-relaxed">
                      Please provide your actual location details. We use this information to curate <strong>exclusive bonus deals</strong> and seasonal offers that are most relevant to your specific country and area.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8" />
        </div>
      </div>

      {/* Sticky nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 md:px-6 py-4 bg-[#0a192f]/90 backdrop-blur-md border-t border-white/10"
        style={{ opacity: showPrivacyModal ? 0 : 1, pointerEvents: showPrivacyModal ? 'none' : 'auto' }}
      >
        <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-medium hover:bg-white/5 transition-all active:scale-[0.98]"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? 'Saving...' : 'Complete Setup ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOnboardingPage;
