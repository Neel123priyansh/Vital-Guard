import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../src/firebase";
import { ref, onValue } from "firebase/database";
import logo from "../src/assets/logo.png";
import axios from "axios";

interface UserData {
    id: string;
    name: string;
    email: string;
}

function ECGGraph({ ecgData }: { ecgData: number[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;

        // ── background ──
        ctx.fillStyle = "#020e14";
        ctx.fillRect(0, 0, W, H);

        // ── grid lines ──
        ctx.strokeStyle = "rgba(46,232,160,0.06)";
        ctx.lineWidth = 1;
        const gridX = 30;
        const gridY = 30;
        for (let x = 0; x <= W; x += gridX) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += gridY) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // ── major grid ──
        ctx.strokeStyle = "rgba(46,232,160,0.12)";
        for (let x = 0; x <= W; x += gridX * 5) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += gridY * 5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // ── centre-line ──
        ctx.strokeStyle = "rgba(46,232,160,0.08)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (ecgData.length < 2) return;

        // ── Normalise data to canvas height ──
        const minVal = Math.min(...ecgData);
        const maxVal = Math.max(...ecgData);
        const range = maxVal - minVal || 1;
        const padding = H * 0.12;

        const norm = (v: number) =>
            H - padding - ((v - minVal) / range) * (H - padding * 2);

        // ── glow layer ──
        ctx.save();
        ctx.shadowColor = "#2ee8a0";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(46,232,160,0.30)";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        const stepGlow = W / (ecgData.length - 1);
        ecgData.forEach((v, i) => {
            const x = i * stepGlow;
            const y = norm(v);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();

        // ── main trace ──
        ctx.strokeStyle = "#2ee8a0";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        const step = W / (ecgData.length - 1);
        ecgData.forEach((v, i) => {
            const x = i * step;
            const y = norm(v);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // ── leading dot ──
        const lastX = (ecgData.length - 1) * step;
        const lastY = norm(ecgData[ecgData.length - 1]);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#2ee8a0";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(46,232,160,0.25)";
        ctx.fill();
    }, [ecgData]);

    useEffect(() => {
        draw();
        const handleResize = () => draw();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [draw]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}

function HeartBeat({ bpm }: { bpm: number }) {
    const duration = bpm > 0 ? 60 / bpm : 1;

    return (
        <div className="relative flex items-center justify-center">
            <div
                className="absolute w-24 h-24 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)",
                    animation: `heartPulseRing ${duration}s ease-out infinite`,
                }}
            />
            <div
                className="absolute w-20 h-20 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
                    animation: `heartPulseRing ${duration}s ease-out infinite 0.1s`,
                }}
            />
            {/* Heart SVG */}
            <svg
                viewBox="0 0 24 24"
                className="w-10 h-10 relative z-10"
                style={{
                    fill: "#ef4444",
                    filter: "drop-shadow(0 0 8px rgba(239,68,68,0.5))",
                    animation: `heartBeat ${duration}s ease-in-out infinite`,
                }}
            >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </div>
    );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
    label,
    value,
    unit,
    icon,
    accent,
    sensorName,
    isDarkMode,
    children,
}: {
    label: string;
    value: string | number;
    unit: string;
    icon: React.ReactNode;
    accent: string;
    sensorName: string;
    isDarkMode: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 group relative overflow-hidden ${isDarkMode
            ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12]"
            : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            }`}>
            {/* Subtle corner glow */}
            <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                    background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
                }}
            />

            <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] font-Raleway ${isDarkMode ? "text-white/30" : "text-slate-400"
                        }`}>
                        {label}
                    </span>
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: accent + "12" }}
                    >
                        {icon}
                    </div>
                </div>

                {/* Sensor badge */}
                <div className="mb-4">
                    <span
                        className="inline-block text-[9px] font-semibold font-Raleway uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
                        style={{
                            color: accent,
                            backgroundColor: accent + "10",
                            border: `1px solid ${accent}20`,
                        }}
                    >
                        {sensorName}
                    </span>
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1.5">
                    <span
                        className="text-4xl font-bold font-Raleway tracking-tight transition-all duration-300"
                        style={{ color: accent }}
                    >
                        {value}
                    </span>
                    <span className={`text-sm font-Raleway font-medium ${isDarkMode ? "text-white/30" : "text-slate-400"
                        }`}>
                        {unit}
                    </span>
                </div>

                {children}
            </div>
        </div>
    );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ connected }: { connected: boolean }) {
    return (
        <span className="relative flex h-2.5 w-2.5">
            {connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ee8a0] opacity-50" />
            )}
            <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? "bg-[#2ee8a0]" : "bg-red-500"
                    }`}
            />
        </span>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Sensor state
    const [ecgBuffer, setEcgBuffer] = useState<number[]>([]);
    const [bpm, setBpm] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [pressure, setPressure] = useState<number>(0);
    const [altitude, setAltitude] = useState<number>(0);
    const [spo2, setSpo2] = useState<number>(0);
    const [firebaseConnected, setFirebaseConnected] = useState(false);

    // AI Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Namaste! I am VitalGuard AI. How can I help with your health today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

    // Health Reports State
    const [uploadedReports, setUploadedReports] = useState<{ name: string; file: File; uploadedAt: string }[]>([]);
    const [healthTips, setHealthTips] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_ECG_POINTS = 300;

    // ── Auth check ──
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

    // ── Firebase Realtime Listeners ──
    useEffect(() => {
        // ECG value (AD8232 pushes individual readings)
        const ecgRef = ref(db, "healthData/59/ecg");
        const unsubEcg = onValue(ecgRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && val !== undefined) {
                setFirebaseConnected(true);
                setEcgBuffer((prev) => {
                    const next = [...prev, Number(val)];
                    return next.length > MAX_ECG_POINTS
                        ? next.slice(next.length - MAX_ECG_POINTS)
                        : next;
                });
            }
        });

        // BPM (MAX30100)
        const bpmRef = ref(db, "healthData/59/hr");
        const unsubBpm = onValue(bpmRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setBpm(Number(val));
        });

        // Temperature
        const tempRef = ref(db, "healthData/59/temp");
        const unsubTemp = onValue(tempRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setTemperature(Number(val));
        });

        // Pressure (BMP-280)
        const pressRef = ref(db, "healthData/59/pressure");
        const unsubPress = onValue(pressRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setPressure(Number(val));
        });

        // Altitude (BMP-280)
        const altRef = ref(db, "healthData/59/altitude");
        const unsubAlt = onValue(altRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setAltitude(Number(val));
        });

        // SpO2 (MAX30100)
        const spo2Ref = ref(db, "healthData/59/spo2");
        const unsubSpo2 = onValue(spo2Ref, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setSpo2(Number(val));
        });

        return () => {
            unsubEcg();
            unsubBpm();
            unsubTemp();
            unsubPress();
            unsubAlt();
            unsubSpo2();
        };
    }, []);

    // ── Update History ──
    useEffect(() => {
        if (bpm > 0 || temperature > 0 || spo2 > 0) {
            setVitalsHistory(prev => {
                const newEntry = { bpm, temperature, spo2, time: new Date().toLocaleTimeString() };
                const updated = [newEntry, ...prev].slice(0, 5); // Keep latest 5
                return updated;
            });
        }
    }, [bpm, temperature, spo2]);

    // ── Chat Logic ──
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const response = await axios.post('https://vitalguard-llm.onrender.com/api/chat', {
                message: userMsg,
                vitals: { bpm, temperature, spo2, history: vitalsHistory }
            });

            setMessages(prev => [...prev, { role: 'ai', text: response.data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to my brain. Is the LLM server running?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    // ── Health Reports Logic ──
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                if (file.type === "application/pdf") {
                    setUploadedReports(prev => [...prev, {
                        name: file.name,
                        file: file,
                        uploadedAt: new Date().toLocaleDateString()
                    }]);
                } else {
                    alert("Please upload PDF files only");
                }
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAnalyzeReports = async () => {
        if (uploadedReports.length === 0) {
            alert("Please upload at least one health report");
            return;
        }

        setIsAnalyzing(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            uploadedReports.forEach((report) => {
                formData.append("files", report.file);
            });

            const response = await axios.post(
                'https://vitalguard-llm.onrender.com/api/analyze-reports',
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            if (response.data.tips) {
                setHealthTips(Array.isArray(response.data.tips) ? response.data.tips : [response.data.tips]);
            }
        } catch (error) {
            console.error("Report analysis error:", error);
            setHealthTips(["Unable to analyze reports. Please check if the LLM server is running."]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const removeReport = (index: number) => {
        setUploadedReports(prev => prev.filter((_, i) => i !== index));
    };

    // ── Logout ──
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

    // Temperature status
    const tempStatus =
        temperature >= 36.1 && temperature <= 37.2
            ? { text: "Normal", color: "#2ee8a0" }
            : temperature > 37.2 && temperature <= 38
                ? { text: "Slightly elevated", color: "#f59e0b" }
                : temperature > 38
                    ? { text: "Fever", color: "#ef4444" }
                    : { text: "Waiting for data…", color: "#64748b" };

    // BPM status
    const bpmStatus =
        bpm >= 60 && bpm <= 100
            ? { text: "Normal", color: "#2ee8a0" }
            : bpm > 100
                ? { text: "Elevated", color: "#f59e0b" }
                : bpm > 0 && bpm < 60
                    ? { text: "Low", color: "#0f7eee" }
                    : { text: "Waiting…", color: "#64748b" };

    // SpO2 status
    const spo2Status =
        spo2 >= 95
            ? { text: "Normal", color: "#2ee8a0" }
            : spo2 > 0 && spo2 < 95
                ? { text: "Low Oxygen", color: "#ef4444" }
                : { text: "Waiting…", color: "#64748b" };

    return (
        <div className={`min-h-screen w-full transition-colors duration-500 relative overflow-hidden ${isDarkMode ? "bg-[#010b10] text-white" : "bg-[#f8fafc] text-slate-900"}`}>
            {/* ── Background ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.04]' : 'opacity-[0.08]'}`}
                    style={{
                        background: "radial-gradient(circle, #2ee8a0 0%, transparent 70%)",
                    }}
                />
                <div
                    className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.06]'}`}
                    style={{
                        background: "radial-gradient(circle, #0f7eee 0%, transparent 70%)",
                    }}
                />
                <div
                    className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.015]' : 'opacity-[0.03]'}`}
                    style={{
                        backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(46,232,160,0.4)' : 'rgba(46,232,160,0.2)'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? 'rgba(46,232,160,0.4)' : 'rgba(46,232,160,0.2)'} 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* ── Top Nav ── */}
            <nav className="relative z-20 flex items-center justify-between px-5 md:px-10 py-3 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-md">
                <Link to="/" className="flex items-center gap-2 group no-underline">
                    <img
                        src={logo}
                        className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                        alt="VitalGuard"
                    />
                    <div>
                        <h1 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            VitalGuard.
                        </h1>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg border transition-all duration-300 ${isDarkMode
                            ? 'bg-white/[0.03] border-white/[0.06] text-amber-400 hover:bg-white/[0.08]'
                            : 'bg-slate-200/50 border-slate-200 text-amber-600 hover:bg-slate-200'
                            }`}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    {/* Connection status */}
                    <div className={`hidden md:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-lg border transition-colors duration-300 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-200/50 border-slate-200'
                        }`}>
                        <StatusDot connected={firebaseConnected} />
                        <span className={`text-[10px] font-Raleway font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-slate-500'
                            }`}>
                            {firebaseConnected ? "Live" : "Offline"}
                        </span>
                    </div>

                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className={`text-xs font-semibold font-Raleway ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {user.name}
                        </span>
                        <span className={`text-[10px] font-Raleway ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                            {user.email}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2ee8a0] to-[#0f7eee] flex items-center justify-center text-[#022633] text-[10px] font-bold font-Raleway">
                        {initials}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/50 font-Raleway border border-white/[0.06] hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── Content ── */}
            <div
                className={`relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
            >
                {/* Page title */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`text-[10px] font-Raleway font-bold tracking-[0.2em] uppercase ${isDarkMode ? "text-white/30" : "text-slate-400"
                            }`}>
                            Health Monitor
                        </p>
                        <div className={`md:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isDarkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-100 border-slate-200"
                            }`}>
                            <StatusDot connected={firebaseConnected} />
                            <span className={`text-[9px] font-Raleway font-semibold uppercase tracking-wider ${isDarkMode ? "text-white/40" : "text-slate-500"
                                }`}>
                                {firebaseConnected ? "Live" : "Offline"}
                            </span>
                        </div>
                    </div>
                    <h1 className={`text-2xl md:text-3xl font-bold font-Raleway tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"
                        }`}>
                        Real-time Vitals
                    </h1>
                </div>

                {/* ════════════════════════════════════════════════════════════════════
            ECG MONITOR
        ════════════════════════════════════════════════════════════════════ */}
                <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden mb-5 ${isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                    {/* ECG header bar */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${isDarkMode ? "border-white/[0.05]" : "border-slate-100"
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <HeartBeat bpm={bpm} />
                                <div className="ml-1">
                                    <h2 className={`text-sm font-bold font-Raleway ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                        ECG Monitor
                                    </h2>
                                    <p className={`text-[9px] font-Raleway uppercase tracking-widest ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>
                                        AD8232 ECG Module
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {bpm > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/15">
                                    <span className="text-red-400 text-lg font-bold font-Raleway">
                                        {bpm}
                                    </span>
                                    <span className="text-red-400/60 text-[10px] font-Raleway font-semibold">
                                        BPM
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <StatusDot connected={firebaseConnected} />
                                <span className={`text-[10px] font-Raleway ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>
                                    {ecgBuffer.length} pts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ECG Waveform */}
                    <div className="h-[260px] md:h-[320px] relative">
                        {ecgBuffer.length > 1 ? (
                            <ECGGraph ecgData={ecgBuffer} />
                        ) : (
                            /* Placeholder when no data */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#020e14]">
                                <div className="relative mb-4">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-10 h-10 text-white/10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1}
                                    >
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                    <div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: "radial-gradient(circle, rgba(46,232,160,0.1) 0%, transparent 70%)",
                                            animation: "pulse 2s ease-in-out infinite",
                                        }}
                                    />
                                </div>
                                <p className="text-white/20 text-sm font-Raleway">
                                    Waiting for ECG data from AD8232…
                                </p>
                                <p className="text-white/10 text-xs font-Raleway mt-1">
                                    Connect your sensor and check Firebase configuration
                                </p>
                            </div>
                        )}

                        {/* Scan line overlay effect */}
                        <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                                background: "linear-gradient(0deg, rgba(2,14,20,0.8) 0%, transparent 8%, transparent 92%, rgba(2,14,20,0.8) 100%)",
                            }}
                        />
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════════
            SENSOR CARDS GRID
        ════════════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* ── BPM Card ── */}
                    <MetricCard
                        label="Heart Rate"
                        value={bpm > 0 ? bpm : "—"}
                        unit="BPM"
                        sensorName="MAX30100"
                        accent="#ef4444"
                        isDarkMode={isDarkMode}
                        icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#ef4444" opacity={0.8}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        }
                    >
                        {/* Mini status badge */}
                        <div className="flex items-center gap-1.5 mt-3">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: bpmStatus.color }}
                            />
                            <span
                                className="text-[10px] font-Raleway font-semibold"
                                style={{ color: bpmStatus.color }}
                            >
                                {bpmStatus.text}
                            </span>
                        </div>
                        {/* Heart animation */}
                        {bpm > 0 && (
                            <div className="absolute bottom-4 right-4 opacity-30">
                                <HeartBeat bpm={bpm} />
                            </div>
                        )}
                    </MetricCard>

                    {/* ── Temperature Card ── */}
                    <MetricCard
                        label="Body Temperature"
                        value={temperature > 0 ? temperature.toFixed(1) : "—"}
                        unit="°C"
                        sensorName="Temp Sensor"
                        accent="#f59e0b"
                        isDarkMode={isDarkMode}
                        icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 4a2 2 0 10-4 0v9.5a4 4 0 108 0V4z" style={{ transform: "scale(0.7) translate(5px, 4px)" }} />
                            </svg>
                        }
                    >
                        <div className="flex items-center gap-1.5 mt-3">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tempStatus.color }}
                            />
                            <span
                                className="text-[10px] font-Raleway font-semibold"
                                style={{ color: tempStatus.color }}
                            >
                                {tempStatus.text}
                            </span>
                        </div>
                        {/* Temperature bar */}
                        {temperature > 0 && (
                            <div className="mt-3">
                                <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${Math.min(((temperature - 34) / 8) * 100, 100)}%`,
                                            background: `linear-gradient(90deg, #2ee8a0, #f59e0b ${temperature > 37.5 ? ", #ef4444" : ""
                                                })`,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[8px] text-white/15 font-Raleway">34°C</span>
                                    <span className="text-[8px] text-white/15 font-Raleway">42°C</span>
                                </div>
                            </div>
                        )}
                    </MetricCard>

                    {/* ── Atmospheric Pressure Card ── */}
                    <MetricCard
                        label="Atmospheric Pressure"
                        value={pressure > 0 ? pressure.toFixed(1) : "—"}
                        unit="hPa"
                        sensorName="BMP-280"
                        accent="#0f7eee"
                        isDarkMode={isDarkMode}
                        icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#0f7eee" strokeWidth={1.5} opacity={0.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        }
                    >
                        {pressure > 0 && (
                            <>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                pressure >= 1013 ? "#2ee8a0" : "#0f7eee",
                                        }}
                                    />
                                    <span
                                        className="text-[10px] font-Raleway font-semibold"
                                        style={{
                                            color: pressure >= 1013 ? "#2ee8a0" : "#0f7eee",
                                        }}
                                    >
                                        {pressure >= 1013 ? "High pressure" : "Low pressure"}
                                    </span>
                                </div>
                                {/* Pressure gauge */}
                                <div className="mt-3">
                                    <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${Math.min(
                                                    ((pressure - 950) / 130) * 100,
                                                    100
                                                )}%`,
                                                background: "linear-gradient(90deg, #0f7eee, #2ee8a0)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[8px] text-white/15 font-Raleway">
                                            950
                                        </span>
                                        <span className="text-[8px] text-white/15 font-Raleway">
                                            1080 hPa
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </MetricCard>

                    {/* ── SpO2 Card ── */}
                    <MetricCard
                        label="Blood Oxygen"
                        value={spo2 > 0 ? spo2 : "—"}
                        unit="%"
                        sensorName="MAX30100"
                        accent="#ec4899"
                        isDarkMode={isDarkMode}
                        icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth={1.5} opacity={0.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                        }
                    >
                        {spo2 > 0 && (
                            <>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: spo2Status.color }}
                                    />
                                    <span
                                        className="text-[10px] font-Raleway font-semibold"
                                        style={{ color: spo2Status.color }}
                                    >
                                        {spo2Status.text}
                                    </span>
                                </div>
                                {/* SpO2 gauge */}
                                <div className="mt-3">
                                    <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(((spo2 - 85) / 15) * 100, 0),
                                                    100
                                                )}%`,
                                                background: spo2 >= 95 ? "#2ee8a0" : "#ef4444",
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[8px] text-white/15 font-Raleway">
                                            85%
                                        </span>
                                        <span className="text-[8px] text-white/15 font-Raleway">
                                            100%
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </MetricCard>

                    {/* ── Altitude Card ── */}
                    <MetricCard
                        label="Altitude"
                        value={altitude > 0 ? altitude.toFixed(1) : "—"}
                        unit="m"
                        sensorName="BMP-280"
                        accent="#a855f7"
                        isDarkMode={isDarkMode}
                        icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={1.5} opacity={0.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l4-4 4 4 8-8v4" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 21v-8m8 8v-4" />
                            </svg>
                        }
                    >
                        {altitude > 0 && (
                            <div className="mt-3 text-[10px] text-white/30 font-Raleway font-medium">
                                Current elevation above sea level
                            </div>
                        )}
                    </MetricCard>
                </div>

                {/* ════════════════════════════════════════════════════════════════════
            HEALTH REPORTS SECTION
        ════════════════════════════════════════════════════════════════════ */}
                <div className="mt-8 mb-6">
                    <div className="mb-4">
                        <p className={`text-[10px] font-Raleway font-bold tracking-[0.2em] uppercase ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>
                            Health Intelligence
                        </p>
                        <h2 className={`text-2xl md:text-3xl font-bold font-Raleway tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                            AI Health Insights
                        </h2>
                    </div>

                    {/* Upload & Analysis Section */}
                    <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-500 ${isDarkMode
                        ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]"
                        : "bg-white border-slate-200 shadow-sm"
                        }`}>
                        <div className={`p-6 border-b ${isDarkMode ? "border-white/[0.05]" : "border-slate-100"}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#2ee8a015" }}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#2ee8a0" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className={`text-base font-bold font-Raleway ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                        Upload Health Reports
                                    </h3>
                                    <p className={`text-xs font-Raleway ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
                                        PDF reports from your medical tests
                                    </p>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div className="mb-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="pdf-upload"
                                />
                                <label
                                    htmlFor="pdf-upload"
                                    className={`block cursor-pointer p-6 border-2 border-dashed rounded-xl transition-all duration-300 text-center ${isDarkMode
                                        ? "border-white/[0.1] hover:border-[#2ee8a0]/50 hover:bg-white/[0.02]"
                                        : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#2ee8a0" strokeWidth={1.5} opacity={0.6}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <div>
                                            <p className={`text-sm font-semibold font-Raleway ${isDarkMode ? "text-white/80" : "text-slate-700"}`}>
                                                Click to upload or drag and drop
                                            </p>
                                            <p className={`text-xs font-Raleway ${isDarkMode ? "text-white/30" : "text-slate-500"}`}>
                                                PDF files only
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Uploaded Files List */}
                            {uploadedReports.length > 0 && (
                                <div className="mb-4">
                                    <p className={`text-xs font-Raleway font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
                                        Uploaded Files
                                    </p>
                                    <div className="space-y-2">
                                        {uploadedReports.map((report, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${isDarkMode
                                                    ? "bg-white/[0.03] border border-white/[0.05]"
                                                    : "bg-slate-50 border border-slate-200"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs font-semibold font-Raleway truncate ${isDarkMode ? "text-white/80" : "text-slate-700"}`}>
                                                            {report.name}
                                                        </p>
                                                        <p className={`text-[10px] font-Raleway ${isDarkMode ? "text-white/30" : "text-slate-500"}`}>
                                                            {report.uploadedAt}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeReport(idx)}
                                                    className={`flex-shrink-0 ml-2 p-1.5 rounded-lg transition-all duration-300 ${isDarkMode
                                                        ? "hover:bg-red-500/10 text-red-400/60 hover:text-red-400"
                                                        : "hover:bg-red-50 text-red-500/60 hover:text-red-600"
                                                        }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Analyze Button */}
                            <div className={`p-4 ${isDarkMode ? "bg-white/[0.01]" : "bg-slate-50"}`}>
                                <button
                                    onClick={handleAnalyzeReports}
                                    disabled={uploadedReports.length === 0 || isAnalyzing}
                                    className={`w-full py-3 rounded-xl font-Raleway font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${uploadedReports.length === 0 || isAnalyzing
                                        ? isDarkMode
                                            ? "bg-white/[0.03] text-white/30 cursor-not-allowed"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : isDarkMode
                                            ? "bg-gradient-to-r from-[#2ee8a0] to-[#0f7eee] text-slate-900 hover:shadow-lg hover:shadow-[#2ee8a0]/20"
                                            : "bg-gradient-to-r from-[#2ee8a0] to-[#0f7eee] text-white hover:shadow-lg"
                                        }`}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Analyzing Reports...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Get Health Tips
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {healthTips.length > 0 && (
                            <div className="mt-6">
                                <div className="mb-4">
                                    <h3 className={`text-lg font-bold font-Raleway ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                        Personalized Health Tips
                                    </h3>
                                    <p className={`text-xs font-Raleway ${isDarkMode ? "text-white/40" : "text-slate-500"}`}>
                                        Based on your uploaded reports and current vitals
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {healthTips.map((tip, idx) => (
                                        <div
                                            key={idx}
                                            className={`backdrop-blur-xl border rounded-2xl p-4 transition-all duration-500 ${isDarkMode
                                                ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12]"
                                                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2ee8a015" }}>
                                                        <svg className="w-4 h-4 text-[#2ee8a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm leading-relaxed font-Raleway ${isDarkMode ? "text-white/80" : "text-slate-700"}`}>
                                                        {tip}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer note */}
                    <div className="mt-6 text-center">
                        <p className={`text-[10px] font-Raleway tracking-wider ${isDarkMode ? "text-white/15" : "text-slate-400"}`}>
                            Data sourced in real-time via Firebase &middot; AD8232 &middot;
                            MAX30100 &middot; BMP-280
                        </p>
                        <h1 className={`text-[15px] mt-3 font-Raleway text-center ${isDarkMode ? "text-[#ECE5E5]" : "text-slate-600"}`}>Made with ❤️ Disha, Aanya, Priyansh</h1>
                    </div>
                </div>

                {/* ── Global Animations & Scrollbar ── */}
                <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        @keyframes heartBeat {
          0%   { transform: scale(1); }
          14%  { transform: scale(1.25); }
          28%  { transform: scale(1); }
          42%  { transform: scale(1.15); }
          56%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes heartPulseRing {
          0%   { transform: scale(0.8); opacity: 0.4; }
          50%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>

                {/* ── Floating Chat Widget ── */}
                <div className="fixed bottom-6 right-6 z-50">
                    {isChatOpen ? (
                        <div className={`w-[350px] h-[500px] border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 transition-colors ${isDarkMode ? "bg-[#021620] border-white/10" : "bg-white border-slate-200"
                            }`}>
                            {/* Chat Header */}
                            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? "bg-gradient-to-r from-[#2ee8a0]/20 to-[#0f7eee]/20 border-white/10" : "bg-slate-50 border-slate-100"
                                }`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#2ee8a0] animate-pulse" />
                                    <span className={`text-sm font-bold font-Raleway ${isDarkMode ? "text-white" : "text-slate-800"}`}>VitalGuard AI</span>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className={`${isDarkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"} transition-colors`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Messages Box */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-transparent">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-Raleway leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[#0f7eee] text-white rounded-tr-none'
                                            : isDarkMode
                                                ? 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                                                : 'bg-slate-100 text-slate-700 border border-slate-200 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className={`p-3 rounded-2xl rounded-tl-none flex gap-1 border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full animate-bounce ${isDarkMode ? "bg-white/40" : "bg-slate-400"}`} />
                                            <div className={`w-1 h-1 rounded-full animate-bounce [animation-delay:0.2s] ${isDarkMode ? "bg-white/40" : "bg-slate-400"}`} />
                                            <div className={`w-1 h-1 rounded-full animate-bounce [animation-delay:0.4s] ${isDarkMode ? "bg-white/40" : "bg-slate-400"}`} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className={`p-4 border-t ${isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-100"
                                }`}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about your health..."
                                        className={`flex-1 border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#2ee8a0]/50 transition-colors font-Raleway ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                                            }`}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatInput.trim() || isTyping}
                                        className="p-2 bg-[#2ee8a0] hover:bg-[#26c085] disabled:opacity-50 disabled:hover:bg-[#2ee8a0] text-[#022633] rounded-xl transition-all duration-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className={`w-14 h-14 bg-gradient-to-br from-[#2ee8a0] to-[#0f7eee] rounded-full shadow-lg flex items-center justify-center text-[#022633] hover:scale-110 transition-all duration-300 group ${!isDarkMode && "shadow-slate-200"
                                }`}
                        >
                            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {/* Notification badge */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 flex items-center justify-center ${isDarkMode ? "border-[#010b10]" : "border-white"
                                }`}>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            </div>
                        </button>
                    )}
                </div>

                {/* ── Global Animations & Scrollbar ── */}
                <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        @keyframes heartBeat {
          0%   { transform: scale(1); }
          14%  { transform: scale(1.25); }
          28%  { transform: scale(1); }
          42%  { transform: scale(1.15); }
          56%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes heartPulseRing {
          0%   { transform: scale(0.8); opacity: 0.4; }
          50%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
            </div>
        </div>
    );
}

