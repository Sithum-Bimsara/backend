import React, { useState, useEffect } from 'react';
import LoginForm from '../../../features/(auth)/components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../../features/(auth)/api/auth.api';
import { UserAuthFormSkeleton } from '../../../components/UserUI';
import { CalendarCheck, Globe, ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <UserAuthFormSkeleton />;

  return (
    <div className="h-screen overflow-hidden flex bg-[#0a192f] font-sans">
      {/* LEFT SIDE - IMAGE */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="/images/maldives-1.jpg"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-br from-[#0a192f]/80 via-[#0e2a47]/60 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between text-white">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" className="h-16 w-auto" alt="LushWare" />
          </div>

          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Welcome Back to <br /> LushWare
            </h2>
            <p className="text-white/80 max-w-md">
              Sign in to continue exploring exclusive deals and managing your bookings.
            </p>
          </div>

          <div className="flex gap-4 flex-wrap mt-8">
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Globe size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Island Escapes
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <CalendarCheck size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Easy Booking
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <ShieldCheck size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Secure Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl px-7 pt-7 pb-6">
            {/* Logo (mobile) */}
            <div className="flex flex-col items-center mb-4 lg:hidden">
              <img src="/images/logo.png" className="h-12 w-auto" alt="LushWare" />
            </div>
            <h2 className="text-xl font-black text-[#0f172a] mb-0.5 text-center lg:text-left">Welcome back</h2>
            <p className="text-xs text-slate-400 mb-4 text-center lg:text-left">Please enter your details to sign in</p>

            <LoginForm />

            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle('login')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
              Continue with Google
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">Don't have an account?</p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 text-center py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-all cursor-pointer"
              >
                Join as Traveller
              </button>
              <button
                type="button"
                onClick={() => navigate('/register/merchant')}
                className="flex-1 text-center py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-all cursor-pointer"
              >
                Join as Merchant
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium tracking-wide transition-colors cursor-pointer"
              >
                ← Back to official website
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
