import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../src/assets/logo.png";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vg_token");
    const userData = localStorage.getItem("vg_user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      navigate("/login");
    }

    setMounted(true);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vg_token");
    localStorage.removeItem("vg_user");
    navigate("/");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen w-full bg-[#022633] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #2ee8a0 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #0f7eee 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(46,232,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,232,160,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Top nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
            alt="VitalGuard"
          />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              VitalGuard.
            </h1>
            <p className="text-[8px] text-[#2ee8a0] font-Raleway">
              by Raphson Robotics
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-white text-sm font-semibold font-Raleway">
              {user.name}
            </span>
            <span className="text-white/40 text-xs font-Raleway">
              {user.email}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2ee8a0] to-[#0f7eee] flex items-center justify-center text-[#022633] text-xs font-bold font-Raleway">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 font-Raleway border border-white/[0.08] hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard content */}
      <div
        className={`relative z-10 max-w-5xl mx-auto px-6 py-12 transition-all duration-700 ease-out ${
          mounted
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        {/* Welcome header */}
        <div className="mb-10">
          <p className="text-[11px] font-Raleway font-bold tracking-[0.18em] text-white/40 uppercase mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-Raleway tracking-tight">
            Welcome back,{" "}
            <span className="text-[#2ee8a0]">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="text-white/40 text-sm mt-2 font-Raleway">
            Your VitalGuard health monitoring overview
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            {
              label: "Health Score",
              value: "92%",
              icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
              accent: "#2ee8a0",
            },
            {
              label: "Tests Completed",
              value: "0",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              accent: "#0f7eee",
            },
            {
              label: "Next Checkup",
              value: "—",
              icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              accent: "#f59e0b",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-widest font-Raleway">
                  {card.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: card.accent + "15" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={card.accent}
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={card.icon}
                    />
                  </svg>
                </div>
              </div>
              <p
                className="text-3xl font-bold font-Raleway"
                style={{ color: card.accent }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Activity section */}
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-white text-lg font-bold font-Raleway mb-4">
            Recent Activity
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-white/40 text-sm font-Raleway">
              No activity yet. Your diagnostic results will appear here.
            </p>
            <p className="text-white/20 text-xs font-Raleway mt-1">
              Start by scheduling your first health check
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
