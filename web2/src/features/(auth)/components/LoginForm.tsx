import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/auth.hooks";
import { useAuth } from "../../../context/useAuth";
import type { LoginDto } from "../dtos/auth.dto";

export default function LoginForm() {
  const { login, loading, error } = useLogin();
  const { fetchUser, resolveRedirect } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginDto>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await login(form);

    if (res) {
      // Fetch user to update auth context
      await fetchUser();

      // Resolve redirect based on user state from login response
      const redirectPath = resolveRedirect({
        user: res.user,
        isTraveller: res.isTraveller,
        isMerchant: res.isMerchant,
        isAdmin: res.isAdmin,
        hasPreferences: res.hasPreferences,
        hasMerchantProfile: res.hasMerchantProfile,
      });

      navigate(redirectPath);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Email */}
      <div className="space-y-1 text-left">
        <label className="text-xs font-semibold text-slate-600">
          Email address
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="name@example.com"
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50
          text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          transition"
        />
      </div>

      {/* Password */}
      <div className="space-y-1 text-left">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-600">
            Password
          </label>
        </div>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50
            text-sm text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            transition pr-10"
          />

          {/* Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Remember */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          Remember me
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 
        text-white font-semibold py-2.5 rounded-xl 
        shadow-md hover:shadow-lg transition-all active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
