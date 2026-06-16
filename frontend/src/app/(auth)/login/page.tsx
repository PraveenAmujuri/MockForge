"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { TunnelTheme } from "@/components/ui/TunnelTheme"; 

export default function Login() {
  const router = useRouter();
  const { login, isLoadingAuth, authError, checkAuth, isAuthenticated } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <>
      {/* Premium Google Typography Fonts & Autofill Overrides */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        .font-dmsans {
          font-family: 'DM Sans', sans-serif;
        }
        /* Forces browser auto-fill boxes to stay deep charcoal gray instead of default light blue */
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
        
        {/* GLOBAL FULL-PAGE BACKDROP TUNNEL CANVAS LAYER */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 mix-blend-screen w-full h-full overflow-hidden">
          <TunnelTheme />
        </div>

        {/* OUTER SPLIT CARD FRAME */}
        <div className="w-full max-w-[calc(100vw-40px)] lg:max-w-[calc(100vw-64px)] h-auto md:h-[calc(100vh-40px)] bg-neutral-900/40 backdrop-blur-xl rounded-[28px] flex flex-col md:flex-row border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden relative z-10 transition-all duration-300 ease-in-out">
          
          {/* LEFT: VISUAL PANEL */}
          <div className="hidden md:flex flex-[1.4] relative flex-col justify-between p-12 lg:p-16 text-white rounded-2xl m-3 overflow-hidden bg-[#030303]/90 border border-white/[0.04] shadow-2xl">
            
            {/* Live Three.js Engine Backdrop */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-85 mix-blend-screen w-full h-full overflow-hidden">
              <TunnelTheme />
            </div>

            {/* Dark Mask to balance text contrast on top of moving vertices */}
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

            {/* A Wise Quote Header tier */}
            <div className="relative z-20 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400 select-none">
              <span className="after:content-[''] after:block after:w-12 after:h-[1px] after:bg-neutral-800 flex items-center gap-3">
                A Wise Quote
              </span>
            </div>

            {/* Headline and Description Block */}
            <div className="relative z-20 space-y-4">
              <h1 className="font-playfair text-5xl lg:text-7xl font-normal leading-[1.1] tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                Forge the <br />Invisible.
              </h1>
              <p className="text-sm lg:text-base font-light text-neutral-400 leading-relaxed max-w-[340px]">
                Great systems aren't seen; they are felt. Welcome back to the anvil—let's make your frontend seamless.
              </p>
            </div>
            </div>

          {/* RIGHT: BRUTALIST SMOKED CHROME GLASS FORM PANEL */}
          <div className="flex-1 bg-neutral-950/20 backdrop-blur-2xl border-l border-white/[0.02] flex flex-col items-center justify-center p-8 md:p-12 lg:p-20">
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
                  Welcome back
                </h2>
                <p className="text-sm text-neutral-500 font-light mt-1">
                  Enter your details to get started
                </p>
              </div>

              {/* Form Component Body */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Server-Side Auth Error Notification Block */}
                {(localError || authError) && (
                  <div id="server-error" className="text-xs font-light text-rose-400 bg-rose-500/[0.06] border border-rose-500/20 rounded-xl p-3.5 shadow-sm">
                    {localError || authError}
                  </div>
                )}

                {/* Email input field block - Pure Deep Charcoal Gray Backing */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="email" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoadingAuth}
                    className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#0c0c0e] px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 font-light"
                    required
                  />
                </div>

                {/* Password input field block - Pure Deep Charcoal Gray Backing */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="password" className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoadingAuth}
                      className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#0c0c0e] pl-4 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 font-light"
                      required
                    />
                    
                    {/* Dynamic visibility toggler handle button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoadingAuth}
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

                {/* THEME BLUE NEON ACTION SUBMISSION BUTTON - Semi-transparent blue border */}
                <button
                  type="submit"
                  disabled={isLoadingAuth}
                  className="w-full h-12 relative overflow-hidden rounded-[30px] bg-transparent text-neutral-300 hover:text-white font-medium text-sm tracking-wide border border-blue-500/40 transition-all duration-300 mt-8 cursor-pointer group disabled:opacity-50 flex items-center justify-center"
                >
                  {/* Sliding In-Fill Background Mask - Tuned to App Accent Blue #2563eb */}
                  <span className="absolute inset-0 bg-blue-600 scale-x-0 origin-left transition-transform duration-300 ease-out z-0 group-hover:scale-x-100 rounded-[30px]" />
                  
                  {/* Real Text Node Content Box */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoadingAuth ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </span>
                </button>

              </form>

                {/* Account conversion footer segment trailing tracker link */}
                <p className="mt-10 text-sm text-neutral-500 text-center font-light">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-white font-medium hover:underline underline-offset-4 decoration-neutral-500 font-semibold">
                    Sign up
                  </Link>
                </p>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}