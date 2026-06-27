import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterUser } from "../hooks/auth.hooks";
import type { RegisterUserDto } from "../dtos/auth.dto";

export default function UserRegisterForm() {
  const { register, loading, error } = useRegisterUser();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterUserDto>({
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
    if (res) navigate("/login");
  };

  const inputStyle =
    "w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2dd4af]/10 focus:border-[#2dd4af] transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <div className="relative">
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          className={inputStyle}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
          className={inputStyle}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#2dd4af]/10 focus:border-[#2dd4af]"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-500 bg-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-[#2dd4af] to-[#25b898] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}