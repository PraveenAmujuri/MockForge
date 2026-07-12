"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { TunnelTheme } from "@/components/ui/TunnelTheme"; 

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing from the link URL.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Reset token is missing from the link URL.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password
      });
      setSuccessMessage(response.data.message || "Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] lg:max-w-[380px]">
      
      {/* Form Logo Header Block */}
      <div className="space-y-2 mb-10 text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white select-none mb-4 group">
          <div className="h-6 w-6 rounded bg-white text-black flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform">
            M
          </div>
          MockForge
        </Link>
        <h2 className="font-playfair text-3xl lg:text-4xl font-medium tracking-tight text-white">
          Reset Password
        </h2>
        <p className="text-sm text-neutral-500 font-light mt-1">
          Enter your new password below
        </p>
      </div>

      {/* Form Component Body */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Server-Side Auth Error Notification Block */}
        {error && (
          <div id="server-error" className="text-xs font-light text-rose-400 bg-rose-500/[0.06] border border-rose-500/20 rounded-xl p-3.5 shadow-sm">
            {error}
          </div>
        )}

        {/* Server-Side Auth Success Notification Block */}
        {successMessage && (
          <div id="server-success" className="text-xs font-light text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-3.5 shadow-sm">
            {successMessage}
          </div>
        )}

        {/* Password input field block - Pure Deep Charcoal Gray Backing */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="password" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !token}
              className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#0c0c0e] pl-4 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 font-light"
              required
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || !token}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 transition-colors bg-transparent border-none outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password input field block - Pure Deep Charcoal Gray Backing */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !token}
              className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#0c0c0e] pl-4 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 font-light"
              required
            />
            
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading || !token}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 transition-colors bg-transparent border-none outline-none cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* THEME BLUE NEON ACTION SUBMISSION BUTTON - Semi-transparent blue border */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full h-12 relative overflow-hidden rounded-[30px] bg-transparent text-neutral-300 hover:text-white font-medium text-sm tracking-wide border border-blue-500/40 transition-all duration-300 mt-8 cursor-pointer group disabled:opacity-50 flex items-center justify-center"
        >
          <span className="absolute inset-0 bg-blue-600 scale-x-0 origin-left transition-transform duration-300 ease-out z-0 group-hover:scale-x-100 rounded-[30px]" />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </span>
        </button>

      </form>

      {/* Account conversion footer segment trailing tracker link */}
      <p className="mt-10 text-sm text-neutral-500 text-center font-light">
        Remember your password?{" "}
        <Link href="/login" className="text-white font-medium hover:underline underline-offset-4 decoration-neutral-500 font-semibold">
          Sign In
        </Link>
      </p>

    </div>
  );
}

export default function ResetPassword() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        .font-dmsans {
          font-family: 'DM Sans', sans-serif;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #0c0c0e inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Main Fullscreen Canvas Container */}
      <div className="min-h-screen w-full bg-[#000000] p-4 md:p-5 flex items-center justify-center font-dmsans tracking-normal antialiased relative overflow-hidden selection:bg-blue-600/30">
        
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 mix-blend-screen w-full h-full overflow-hidden">
          <TunnelTheme />
        </div>

        {/* OUTER SPLIT CARD FRAME */}
        <div className="w-full max-w-[calc(100vw-40px)] lg:max-w-[calc(100vw-64px)] h-auto md:h-[calc(100vh-40px)] bg-neutral-900/40 backdrop-blur-xl rounded-[28px] flex flex-col md:flex-row border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden relative z-10">
          
          {/* LEFT: VISUAL PANEL */}
          <div className="hidden md:flex flex-[1.4] relative flex-col justify-between p-12 lg:p-16 text-white rounded-2xl m-3 overflow-hidden bg-[#030303]/90 border border-white/[0.04] shadow-2xl">
            
            <div className="absolute inset-0 z-0 pointer-events-none opacity-85 mix-blend-screen w-full h-full overflow-hidden">
              <TunnelTheme />
            </div>

            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

            <div className="relative z-20 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400 select-none">
              <span className="after:content-[''] after:block after:w-12 after:h-[1px] after:bg-neutral-800 flex items-center gap-3">
                A Wise Quote
              </span>
            </div>

            <div className="relative z-20 space-y-4">
              <h1 className="font-playfair text-5xl lg:text-7xl font-normal leading-[1.1] tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                Forge the <br />Invisible.
              </h1>
              <p className="text-sm lg:text-base font-light text-neutral-400 leading-relaxed max-w-[340px]">
                Great systems aren&apos;t seen; they are felt. Welcome back to the anvil—let&apos;s make your frontend seamless.
              </p>
            </div>
          </div>

          {/* RIGHT: BRUTALIST SMOKED CHROME GLASS FORM PANEL */}
          <div className="flex-1 bg-neutral-950/20 backdrop-blur-2xl border-l border-white/[0.02] flex flex-col items-center justify-center p-8 md:p-12 lg:p-20">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-white" />}>
              <ResetPasswordForm />
            </Suspense>
          </div>

        </div>
      </div>
    </>
  );
}
