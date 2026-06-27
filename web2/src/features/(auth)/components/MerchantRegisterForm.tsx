import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMerchant } from "../hooks/auth.hooks";
import type { RegisterMerchantDto } from "../dtos/auth.dto";

export default function MerchantRegisterForm() {
  const { register, loading, error } = useRegisterMerchant();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterMerchantDto>({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await register(form);

    if (res) {
      // After merchant registration, go to login
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-slate-600">Full name</label>
        <input
          name="name"
          placeholder="Your full name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white
          text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-slate-600">Business email</label>
        <input
          name="email"
          type="email"
          placeholder="business@example.com"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white
          text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-slate-600">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white
            text-sm text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white
        font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all
        active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create merchant account"}
      </button>
    </form>
  );
}
