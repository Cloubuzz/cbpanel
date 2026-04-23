import React, { useState } from "react";
import {
  Zap,
  ArrowRight,
  Lock,
  Mail,
  Fingerprint,
  ScanFace,
  Globe,
} from "lucide-react";
import type { LoginCredentials } from "../store/slices/appSlice";

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onClearError: () => void;
  isLoading: boolean;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({
  onLogin,
  onClearError,
  isLoading,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter username and password.");
      return;
    }

    setFormError(null);
    await onLogin({
      email: email.trim(),
      password,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex items-center justify-center relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      {/* --- Futuristic Animated Background --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep Space Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617]"></div>

        {/* Animated Aurora / Blobs */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spin-slow opacity-30">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-teal-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000"></div>
        </div>

        {/* Moving Grid Floor (Perspective) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* Floating Particles (CSS Only for performance) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float opacity-50"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float animation-delay-2000 opacity-50"></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float animation-delay-4000 opacity-50"></div>
        </div>
      </div>

      {/* --- Login Card Container --- */}
      <div className="relative z-10 w-full max-w-md p-6 perspective-1000">
        {/* Holographic Border Effect Wrapper */}
        <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_40px_-10px_rgba(45,212,191,0.3)]">
          {/* Main Card Content */}
          <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl p-8 relative overflow-hidden">
            {/* Top Shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

            {/* Header */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl mb-4 group-hover:border-teal-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Zap
                  size={36}
                  className="text-teal-400 relative z-10 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                  fill="currentColor"
                />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                Cloubuzz
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-teal-400/80 bg-teal-950/30 px-3 py-1 rounded-full border border-teal-900/50">
                <Globe size={10} />
                <span>SECURE ACCESS v3.0</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">
                  Identity
                </label>
                <div
                  className={`relative bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 flex items-center transition-all duration-300 group-focus-within:border-teal-500/50 ${focusedField === "email" ? "border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.1)]" : "hover:border-slate-600"}`}
                >
                  <Mail
                    size={18}
                    className={`mr-3 transition-colors ${focusedField === "email" ? "text-teal-400" : "text-slate-500"}`}
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) {
                        setFormError(null);
                      }
                      if (error) {
                        onClearError();
                      }
                    }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter corporate email"
                    autoComplete="username"
                    className="bg-transparent border-none w-full text-sm text-white placeholder:text-slate-600 focus:ring-0 p-0 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">
                  Credential
                </label>
                <div
                  className={`relative bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 flex items-center transition-all duration-300 ${focusedField === "password" ? "border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.1)]" : "hover:border-slate-600"}`}
                >
                  <Lock
                    size={18}
                    className={`mr-3 transition-colors ${focusedField === "password" ? "text-teal-400" : "text-slate-500"}`}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError) {
                        setFormError(null);
                      }
                      if (error) {
                        onClearError();
                      }
                    }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter passkey"
                    autoComplete="current-password"
                    className="bg-transparent border-none w-full text-sm text-white placeholder:text-slate-600 focus:ring-0 p-0 outline-none"
                  />
                </div>
              </div>

              {(formError || error) && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  {formError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 border border-teal-500/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col items-center gap-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Biometric Login
              </p>
              <div className="flex gap-4">
                <button className="p-3 rounded-full bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-all">
                  <ScanFace size={20} />
                </button>
                <button className="p-3 rounded-full bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-all">
                  <Fingerprint size={20} />
                </button>
              </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/30 rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/30 rounded-br-xl"></div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono">
            <span>SYSTEM STATUS:</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>{" "}
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Styles for custom animations not in standard tailwind */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
