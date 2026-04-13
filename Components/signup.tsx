import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../src/assets/logo.png";
import FloatingLines from "../src/assets/background";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("vg_token", data.token);
      localStorage.setItem("vg_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  /* password strength indicator */
  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0-5
  };
  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][
    strength
  ];
  const strengthColor = [
    "transparent",
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#2ee8a0",
  ][strength];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#022633]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingLines />
        {/* Grid pattern */}
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-[440px] mx-4 my-8 transition-all duration-700 ease-out ${mounted
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
          }`}
      >
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Logo & heading */}
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <img
                src={logo}
                className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                alt="VitalGuard"
              />
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  VitalGuard.
                </h1>
                <p className="text-[9px] text-[#2ee8a0] font-Raleway">
                  by Raphson Robotics
                </p>
              </div>
            </Link>
            <h2 className="text-2xl font-bold text-white font-Raleway tracking-tight">
              Create your account
            </h2>
            <p className="text-white/50 text-sm mt-1 font-Raleway">
              Join VitalGuard for smarter diagnostics
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-Raleway flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest font-Raleway">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2ee8a0] transition-colors duration-200">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm font-Raleway outline-none focus:border-[#2ee8a0]/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2ee8a0]/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest font-Raleway">
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2ee8a0] transition-colors duration-200">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm font-Raleway outline-none focus:border-[#2ee8a0]/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2ee8a0]/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest font-Raleway">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2ee8a0] transition-colors duration-200">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm font-Raleway outline-none focus:border-[#2ee8a0]/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2ee8a0]/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-200 cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.11 6.11m3.768 3.768l4.242 4.242m0 0l3.768 3.768M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            i <= strength ? strengthColor : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[10px] font-Raleway font-semibold tracking-wide"
                    style={{ color: strengthColor }}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest font-Raleway">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#2ee8a0] transition-colors duration-200">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border text-white placeholder-white/20 text-sm font-Raleway outline-none focus:bg-white/[0.07] focus:ring-1 transition-all duration-200 ${confirmPassword.length > 0 && confirmPassword !== password
                    ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20"
                    : confirmPassword.length > 0 && confirmPassword === password
                      ? "border-[#2ee8a0]/40 focus:border-[#2ee8a0]/50 focus:ring-[#2ee8a0]/20"
                      : "border-white/[0.08] focus:border-[#2ee8a0]/50 focus:ring-[#2ee8a0]/20"
                    }`}
                />
                {confirmPassword.length > 0 && confirmPassword === password && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2ee8a0]">
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide font-Raleway transition-all duration-300 cursor-pointer relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? "rgba(46,232,160,0.3)"
                  : "linear-gradient(135deg, #2ee8a0 0%, #0f7eee 100%)",
                color: "#022633",
              }}
            >
              <span
                className={`inline-flex items-center gap-2 transition-all duration-200 ${loading ? "opacity-0" : "opacity-100"
                  }`}
              >
                Create Account
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#022633]/30 border-t-[#022633] rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-white/25 text-xs font-Raleway uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Already have account */}
          <Link
            to="/login"
            id="existing-account-link"
            className="block w-full py-3.5 rounded-xl text-center text-sm font-semibold text-white/70 font-Raleway border border-white/[0.08] hover:border-[#2ee8a0]/30 hover:text-[#2ee8a0] hover:bg-[#2ee8a0]/5 transition-all duration-300 no-underline"
          >
            Already have an account? Sign in
          </Link>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/30 text-xs font-Raleway hover:text-white/60 transition-colors duration-200 no-underline inline-flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.04; transform: scale(1); }
          50% { opacity: 0.08; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
