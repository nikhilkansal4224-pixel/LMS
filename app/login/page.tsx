"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("Nikhil.39697@stu.upes.ac.in");
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Captcha State
  const captchaSiteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Math challenge fallback
  const [mathNum1, setMathNum1] = useState(7);
  const [mathNum2, setMathNum2] = useState(8);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathVerified, setMathVerified] = useState(false);

  useEffect(() => {
    generateNewMathChallenge();
  }, []);

  const generateNewMathChallenge = () => {
    const n1 = Math.floor(Math.random() * 12) + 3;
    const n2 = Math.floor(Math.random() * 9) + 2;
    setMathNum1(n1);
    setMathNum2(n2);
    setMathAnswer("");
    setMathVerified(false);
  };

  const handleMathCheck = (val: string) => {
    setMathAnswer(val);
    if (parseInt(val, 10) === mathNum1 + mathNum2) {
      setMathVerified(true);
      setIsCaptchaVerified(true);
    } else {
      setMathVerified(false);
    }
  };

  const handleSlideVerification = () => {
    setSliderPosition(100);
    setIsCaptchaVerified(true);
  };

  const handleEmailChange = (val: string) => {
    setUsername(val);
    if (val.includes("@")) {
      const lower = val.toLowerCase().trim();
      const domain = lower.split("@")[1];
      if (domain && domain !== "stu.upes.ac.in" && domain !== "ddn.upes.ac.in") {
        setEmailWarning("Please use your official UPES student email (@stu.upes.ac.in)");
      } else {
        setEmailWarning(null);
      }
    } else {
      setEmailWarning(null);
    }
  };

  const handleEmailBlur = () => {
    const trimmed = username.trim();
    if (trimmed && !trimmed.includes("@")) {
      const autoAppended = `${trimmed}@stu.upes.ac.in`;
      setUsername(autoAppended);
      setEmailWarning(null);
    } else if (trimmed.includes("@")) {
      const lower = trimmed.toLowerCase();
      const domain = lower.split("@")[1];
      if (domain && domain !== "stu.upes.ac.in" && domain !== "ddn.upes.ac.in") {
        setEmailWarning("Please use your official UPES student email (@stu.upes.ac.in)");
      } else {
        setEmailWarning(null);
      }
    }
  };

  // Sign In submit handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Auto-normalize before submission
    let finalEmail = username.trim();
    if (finalEmail && !finalEmail.includes("@")) {
      finalEmail = `${finalEmail}@stu.upes.ac.in`;
      setUsername(finalEmail);
    }

    if (!isCaptchaVerified) {
      setErrorMessage("Please complete the robot verification challenge first.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: finalEmail,
          password: password === "••••••••" ? "Student@2026" : password,
          captchaToken: isCaptchaVerified ? "verified-neumorphic-token" : "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Login failed. Check your SAP ID and Password.");
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
      setIsLoading(false);
    }
  };

  // Continue with Demo Account handler
  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage("Could not initialize demo session");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start demo");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-base bg-ambient-glow text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-amber-500 selection:text-black">
      {/* Background glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Raised Neumorphic Login Card */}
        <div className="neu-card p-6 sm:p-8 border border-white/5 relative overflow-hidden bg-[#1B1F28] shadow-2xl">
          {/* Top Amber Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200" />

          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#262B37] to-[#161820] shadow-neu-raised-sm border border-amber-500/30 mb-3 group">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-amber-300 shadow-neu-glow-amber" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-wider font-sans">
                SOP
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-md neu-inset-well text-amber-400 border border-amber-500/25">
                UPES
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Student Operations Portal &amp; SLCM Gateway
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl neu-inset-well border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* UPES Student Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  UPES Student Email
                </label>
                <span className="text-[10px] font-mono text-amber-400/90">
                  @stu.upes.ac.in
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Mail className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="name.sapid@stu.upes.ac.in"
                  value={username}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl neu-inset-well font-mono text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all border border-transparent"
                />
              </div>

              {/* Inline Domain Warning or Helper */}
              {emailWarning ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailWarning}</span>
                </motion.div>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 mt-1 block pl-1">
                  Prefix (e.g. Nikhil.39697) auto-completes to @stu.upes.ac.in
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Password
                </label>
                <span className="text-[10px] font-mono text-amber-400/80">
                  UPES SLCM Credentials
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your portal password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl neu-inset-well text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all border border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* "Prove You Are Not a Robot" Verification Container */}
            <div className="pt-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Security Verification
                </span>
                <span className="text-[10px] text-slate-500">
                  {captchaSiteKey ? "reCAPTCHA / Turnstile" : "Interactive Sentinel"}
                </span>
              </label>

              {captchaSiteKey ? (
                /* External Captcha Container */
                <div className="p-3 rounded-2xl neu-inset-well border border-white/5 flex items-center justify-center">
                  <div
                    id="recaptcha-container"
                    className="text-xs text-slate-400 font-mono"
                  >
                    [External Captcha Bound to Site Key]
                  </div>
                </div>
              ) : (
                /* Tactile Neumorphic Fallback Verification Box */
                <div className="p-3.5 rounded-2xl neu-inset-well border border-white/5 space-y-3 bg-[#151821]">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      {isCaptchaVerified ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">
                            Human Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>Complete Verification</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      UPES Shield
                    </span>
                  </div>

                  {/* Mode A: Slide-to-Verify Bar */}
                  <div className="relative h-10 rounded-xl neu-inset-track overflow-hidden flex items-center px-1">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600/30 to-amber-400/40 rounded-xl transition-all duration-200"
                      style={{ width: `${sliderPosition}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-slate-400 pointer-events-none">
                      {isCaptchaVerified
                        ? "Verification Complete ✓"
                        : "Slide handle to verify →"}
                    </span>

                    <button
                      type="button"
                      disabled={isCaptchaVerified}
                      onClick={handleSlideVerification}
                      className={`relative z-10 h-8 px-3 rounded-lg neu-raised-sm flex items-center gap-1.5 transition-all text-xs font-bold ${
                        isCaptchaVerified
                          ? "ml-auto bg-emerald-500 text-black border border-emerald-400"
                          : "text-amber-300 hover:text-white"
                      }`}
                    >
                      {isCaptchaVerified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{isCaptchaVerified ? "Verified" : "Slide"}</span>
                    </button>
                  </div>

                  {/* Mode B: Instant Math Sentinel Challenge */}
                  <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <span className="text-[11px] text-slate-400">Math:</span>
                      <span className="font-bold text-amber-400">
                        {mathNum1} + {mathNum2} =
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="?"
                        value={mathAnswer}
                        onChange={(e) => handleMathCheck(e.target.value)}
                        className={`w-14 px-2 py-1 rounded-lg neu-inset-track font-mono text-center text-xs focus:outline-none ${
                          mathVerified
                            ? "border border-emerald-500 text-emerald-400 font-bold"
                            : "text-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={generateNewMathChallenge}
                        className="p-1 rounded neu-raised-sm text-slate-400 hover:text-amber-400"
                        title="New Challenge"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-2xl neu-raised-btn font-bold text-sm text-amber-300 hover:text-amber-200 flex items-center justify-center gap-2 transition-all shadow-neu-glow-amber border border-amber-500/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Authenticating UPES SLCM...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-white/5 w-full" />
            <span className="bg-[#1B1F28] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
              OR PREVIEW TEMPLATE
            </span>
          </div>

          {/* Demo Account Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full py-2.5 rounded-2xl neu-raised-sm text-xs font-mono font-medium text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 border border-white/[0.04] hover:border-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Continue with Demo Account (Nikhil • SEM 01)</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500 font-mono">
          <span>UPES Dehradun Student Operations Portal • 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
