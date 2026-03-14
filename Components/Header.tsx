import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import video from "../src/assets/Intro_video.mp4"

// ─── Header ───────────────────────────────────────────────────────────────────
function  Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  const navItems = ["Dashboard", "About Us", "Contact Us", "Login"];

  return (
    <div className="fixed top-[4%] left-0 right-0 z-50 flex flex-col items-center">
      <div className="w-[80%] rounded-full backdrop-blur-lg  bg-white/5 border-b border-white/10 bg-[#f7efd8]">
        <div className="flex justify-between items-center px-6 md:px-16 h-16 md:h-17">
          <h1 onClick={() => navigate("/Check")} className="text-2xl md:text-3xl font-bold text-white cursor-pointer select-none">
            VitalGuard. <br/> <h1 className="text-[10px] text-[#2ee8a0] ml-1 font-Raleway">by Raphson Robotics</h1>
            
          </h1>

          {/* Desktop Nav */}
          <ul className="hidden md:flex flex-row text-base text-white gap-1 font-semibold">
            {navItems.map((item) => (
              <li
                key={item}
                className="px-4 py-2 cursor-pointer hover:border-b-2 hover:border-white/60 transition-all duration-150"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
            <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"} bg-black/60 backdrop-blur-md`}>
          <ul className="flex flex-col text-base text-white font-semibold px-6 py-2">
            {navItems.map((item) => (
              <li
                key={item}
                className="py-4 border-b border-white/20 last:border-b-0 cursor-pointer hover:pl-2 transition-all duration-150"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main (Full-screen hero with video) ───────────────────────────────────────
function Main() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const togglePause = () => {
    if (videoRef.current) {
      paused ? videoRef.current.play() : videoRef.current.pause();
      setPaused(!paused);
    }
  };

  return (
    <section className="relative w-full h-[550px] overflow-hidden bg-[#0f7eee]">

      {/* Full-screen background video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-fit object-cover transition-opacity duration-[900ms] ${loaded ? "opacity-60" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1600&q=80"
      >
        <source src={video} type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(5,10,15,0.82) 0%, rgba(5,10,15,0.45) 50%, rgba(0,30,20,0.25) 100%)",
        }}
      />

      {/* Scan line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 z-20 opacity-60"
        style={{
          background: "linear-gradient(90deg, transparent, #2ee8a0 40%, transparent)",
          animation: "scanPulse 3s ease-in-out infinite",
        }}
      />

      {/* Hero text content */}
      <div
        className={`relative z-20 h-full flex flex-col justify-end px-6 md:px-55 pb-16 md:pb-24 max-w-full transition-all duration-[900ms] ease-out ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <p className="text-[11px] font-Raleway font-bold tracking-[0.18em] w-full text-white/60 uppercase mb-4">Our Promise</p>
          <h1 className="text-[clamp(2rem,5vw,3.8rem)] font-Raleway text-white w-full leading-[1.12] tracking-tight mb-8">
             More intelligent healthcare for all with{" "}<em className="not-italic text-[#2ee8a0]">single device</em>{" "}diagnostics.
          </h1>
        <a
          href="#technology"
          className="inline-flex items-center backdrop-blur-lg  bg-white/5 border-b border-white/10 gap-2.5 px-6 py-3 border rounded-full text-white text-xl font-semibold w-fit bg-transparent transition-all duration-200 hover:bg-[#2ee8a0]/15 hover:border-[#2ee8a0] hover:text-[#2ee8a0] no-underline group">
            Our Technology
        </a>
      </div>

      {/* Pause / Play button */}
      <button
        onClick={togglePause}
        aria-label={paused ? "Play video" : "Pause video"}
        className="absolute bottom-6 right-6 z-30 w-10 h-10 flex items-center justify-center border border-white/40 rounded-md bg-black/30 text-white/70 text-xs backdrop-blur-sm transition-all duration-200 hover:border-white/80 hover:bg-black/50"
      >
        {paused ? "▶" : "❙❙"}
      </button>

      <style>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.3; transform: scaleX(0.6); }
          50%       { opacity: 0.7; transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}

// ─── Page (default export) ────────────────────────────────────────────────────
export default function Page() {
  return (
    <div>
      <Header />
      <Main />
    </div>
  );
}