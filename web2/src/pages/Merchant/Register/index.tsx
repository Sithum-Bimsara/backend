import React, { useState, useEffect } from 'react';
import MerchantRegisterForm from '../../../features/(auth)/components/MerchantRegisterForm';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../../features/(auth)/api/auth.api';
import { UserAuthFormSkeleton } from '../../../components/UserUI';
import { TrendingUp, Gem, Handshake } from 'lucide-react';

const MerchantRegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <UserAuthFormSkeleton />;

  const handleGoogleRegister = async () => {
    await signInWithGoogle('register_merchant');
  };

  return (
    <div className="h-screen overflow-hidden flex bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f] font-sans">
      {/* LEFT SIDE - IMAGE */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="/images/maldives-2.png"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0a192f]/80 via-[#0e2a47]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-16 flex flex-col justify-between text-white">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" className="h-16 w-auto" alt="LushWare" />
          </div>

          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Scale Your <br /> Travel Business
            </h2>
            <p className="text-white/80 max-w-md">
              Showcase your Maldivian resort, villa, or experience to travelers worldwide.
            </p>
          </div>

          <div className="flex gap-4 flex-wrap mt-8">
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <TrendingUp size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Grow Reach
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Gem size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Premium Listings
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Handshake size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Trusted Platform
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Logo (mobile) */}
            <div className="flex flex-col items-center mb-4 lg:hidden">
              <img src="/images/logo.png" className="h-12 w-auto" alt="LushWare" />
            </div>

            <h2 className="text-2xl font-black text-[#0f172a] mb-1">
              Grow Your Business
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Create your merchant account
            </p>

            <MerchantRegisterForm />

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
              Sign up with Google
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full mt-3 text-sm text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              Register as Traveller instead
            </button>

            <p className="text-xs text-center text-slate-500 mt-6">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="text-indigo-600 font-semibold cursor-pointer">
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegisterPage;
