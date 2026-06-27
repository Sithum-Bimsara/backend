import { useState, useEffect } from 'react';
import UserRegisterForm from '../../../features/(auth)/components/UserRegisterForm';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../../features/(auth)/api/auth.api';
import { UserAuthFormSkeleton } from '../../../components/UserUI';
import { Star, Plane, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate brief loading to show skeleton
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleRegister = async () => {
    await signInWithGoogle('register_user');
  };

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

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0a192f]/80 via-[#0e2a47]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-16 flex flex-col justify-between text-white">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" className="h-16 w-auto" alt="LushWare" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Discover Your <br /> Next Escape
            </h2>
            <p className="text-white/80 max-w-md">
              Discover handpicked Maldivian islands, overwater villas, and unforgettable ocean escapes.
            </p>
          </div>

          {/* Floating tags */}
          <div className="flex gap-4 flex-wrap mt-8">
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Globe size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Private Islands
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Star size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                5★ Resorts
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/25 backdrop-blur-xl border border-yellow-500/20 text-white/90 shadow-lg">
              <Plane size={17} className="text-yellow-400" strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide">
                Luxury Travel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 relative">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f]" />

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-md">
          
          <div className="bg-white rounded-3xl shadow-2xl p-8">

            {/* Logo (mobile) */}
            <div className="flex flex-col items-center mb-6 lg:hidden">
              <img src="/images/logo.png" className="h-14 w-auto" alt="LushWare" />
            </div>

            <h2 className="text-2xl font-black text-[#0f172a] mb-1 text-center lg:text-left">
              Start Your Adventure
            </h2>
            <p className="text-sm text-slate-500 mb-6 text-center lg:text-left">
              Create your traveler account
            </p>

            <UserRegisterForm />

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                className="w-4 h-4"
                alt="Google"
              />
              <span>Sign up with Google</span>
            </button>

            {/* Merchant */}
            <button
              type="button"
              onClick={() => navigate('/register/merchant')}
              className="w-full mt-3 text-sm text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Register as Merchant instead
            </button>

            {/* Login */}
            <p className="text-xs text-center text-slate-500 mt-6">
              Already have an account?{" "}
              <span
                onClick={() => navigate('/login')}
                className="text-[#2dd4af] font-semibold cursor-pointer"
              >
                Sign in
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}