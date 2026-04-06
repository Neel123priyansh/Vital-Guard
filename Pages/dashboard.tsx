import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../src/firebase";
import { ref, onValue } from "firebase/database";
import logo from "../src/assets/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
    id: string;
    name: string;
    email: string;
}

// ─── ECG Canvas Component ─────────────────────────────────────────────────────
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

// ─── Heart Beat Animation ─────────────────────────────────────────────────────
function HeartBeat({ bpm }: { bpm: number }) {
    const duration = bpm > 0 ? 60 / bpm : 1;

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
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
    children,
}: {
    label: string;
    value: string | number;
    unit: string;
    icon: React.ReactNode;
    accent: string;
    sensorName: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 group relative overflow-hidden">
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
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-Raleway">
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
                    <span className="text-sm text-white/30 font-Raleway font-medium">
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

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);

    // Sensor state
    const [ecgBuffer, setEcgBuffer] = useState<number[]>([]);
    const [bpm, setBpm] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [pressure, setPressure] = useState<number>(0);
    const [altitude, setAltitude] = useState<number>(0);
    const [spo2, setSpo2] = useState<number>(0);
    const [firebaseConnected, setFirebaseConnected] = useState(false);

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
        const ecgRef = ref(db, "sensorData/ecg");
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
        const bpmRef = ref(db, "sensorData/bpm");
        const unsubBpm = onValue(bpmRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setBpm(Number(val));
        });

        // Temperature
        const tempRef = ref(db, "sensorData/temperature");
        const unsubTemp = onValue(tempRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setTemperature(Number(val));
        });

        // Pressure (BMP-280)
        const pressRef = ref(db, "sensorData/pressure");
        const unsubPress = onValue(pressRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setPressure(Number(val));
        });

        // Altitude (BMP-280)
        const altRef = ref(db, "sensorData/altitude");
        const unsubAlt = onValue(altRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setAltitude(Number(val));
        });

        // SpO2 (MAX30100)
        const spo2Ref = ref(db, "sensorData/spo2");
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
        <div className="min-h-screen w-full bg-[#010b10] relative overflow-hidden">
            {/* ── Background ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
                    style={{
                        background: "radial-gradient(circle, #2ee8a0 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
                    style={{
                        background: "radial-gradient(circle, #0f7eee 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(46,232,160,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(46,232,160,0.4) 1px, transparent 1px)",
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
                        <h1 className="text-base font-bold text-white leading-tight">
                            VitalGuard.
                        </h1>
                        <p className="text-[8px] text-[#2ee8a0] font-Raleway">
                            by Raphson Robotics
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Connection status */}
                    <div className="hidden md:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <StatusDot connected={firebaseConnected} />
                        <span className="text-[10px] font-Raleway font-semibold text-white/40 uppercase tracking-wider">
                            {firebaseConnected ? "Live" : "Offline"}
                        </span>
                    </div>

                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-white text-xs font-semibold font-Raleway">
                            {user.name}
                        </span>
                        <span className="text-white/30 text-[10px] font-Raleway">
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
                        <p className="text-[10px] font-Raleway font-bold tracking-[0.2em] text-white/30 uppercase">
                            Health Monitor
                        </p>
                        <div className="md:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                            <StatusDot connected={firebaseConnected} />
                            <span className="text-[9px] font-Raleway font-semibold text-white/40 uppercase tracking-wider">
                                {firebaseConnected ? "Live" : "Offline"}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-Raleway tracking-tight">
                        Real-time Vitals
                    </h1>
                </div>

                {/* ════════════════════════════════════════════════════════════════════
            ECG MONITOR
        ════════════════════════════════════════════════════════════════════ */}
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
                    {/* ECG header bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <HeartBeat bpm={bpm} />
                                <div className="ml-1">
                                    <h2 className="text-sm font-bold text-white font-Raleway">
                                        ECG Monitor
                                    </h2>
                                    <p className="text-[9px] text-white/30 font-Raleway uppercase tracking-widest">
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
                                <span className="text-[10px] text-white/30 font-Raleway">
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

                {/* Footer note */}
                <div className="mt-6 text-center">
                    <p className="text-white/15 text-[10px] font-Raleway tracking-wider">
                        Data sourced in real-time via Firebase &middot; AD8232 &middot;
                        MAX30100 &middot; BMP-280
                    </p>
                    <h1 className='text-[15px] mt-3 font-Raleway text-[#ECE5E5] text-center'>Made with ❤️ Disha, Aanya, Priyansh</h1>
                </div>
            </div>

            {/* ── Global Animations ── */}
            <style>{`
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
    );
}
