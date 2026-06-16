"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Terminal, Layers, Shield, Zap, ArrowRight } from "lucide-react";
import { WarpBackground } from "@/components/ui/warp-background";
import { TunnelTheme } from "@/components/ui/TunnelTheme"; 

export default function Home() {
  const { checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-foreground transition-colors duration-150 tracking-normal antialiased relative selection:bg-blue-500/30">
      
      {/* FIXED BACKDROP TUNNEL LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen w-full h-full overflow-hidden">
        <TunnelTheme />
      </div>

      {/* INTERACTIVE CONTENT VIEW WRAPPER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header Container */}
        <header className="border-b border-white/[0.05] backdrop-blur-md sticky top-0 z-50 bg-[#000000]/40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg select-none">
                M
              </div>
              <span className="font-semibold text-lg tracking-tight text-white font-sans">MockForge</span>
            </div>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 pt-32 pb-24 max-w-5xl mx-auto text-center">

          {/* Sophisticated Dual-Weight Headline */}
          <h1 className="text-5xl md:text-7xl tracking-tight max-w-4xl mb-8 flex flex-col gap-2">
            <span className="font-black bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent uppercase tracking-wide">
              Mock REST APIs
            </span>
            <span className="font-light text-neutral-400 text-4xl md:text-6xl tracking-wide mt-1">
              Before they are built.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base md:text-lg font-light text-neutral-400/90 max-w-2xl mb-14 leading-relaxed tracking-wide px-4">
            Keep frontend development moving while backend services are still in progress. 
            Create mock endpoints, configure responses, simulate latency, and inspect 
            incoming requests from a single dashboard.
          </p>

          {/* Action Button Interface Links with Balanced Spacing */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 mb-24 items-center justify-center w-full sm:w-auto">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group shadow-[0_0_25px_rgba(37,99,235,0.15)] hover:shadow-[0_0_35px_rgba(37,99,235,0.35)]"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] font-medium text-sm transition-all flex items-center justify-center text-white shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:border-white/[0.15]"
            >
              Explore Features
            </a>
          </div>

          {/* Code Preview Section wrapped with Warp Tunnel */}
          <div className="w-full max-w-3xl mt-4">
            <WarpBackground 
              perspective={180}
              beamsPerSide={4} 
              beamDuration={4}
              className="w-full rounded-2xl border border-white/[0.05] bg-[#030303] p-12 shadow-2xl overflow-hidden"
            >
              {/* Inner Terminal Container Card */}
              <div className="w-full rounded-xl border border-white/[0.08] overflow-hidden bg-[#0a0a0c] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">App.tsx</span>
                </div>

                <div className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto bg-[#050507] text-neutral-300">
                  <span className="text-[#a78bfa]">fetch</span>
                  <span>(</span>
                  <span className="text-[#34d399]">&apos;https://mock.praveenai.tech/mock/my-app/api/products&apos;</span>
                  <span>, &#123;</span>
                  <br />
                  <span className="pl-4">headers: &#123;</span>
                  <br />
                  <span className="pl-8 text-[#f472b6]">&apos;X-API-Key&apos;</span>
                  <span>: </span>
                  <span className="text-[#34d399]">&apos;mf_live_9f8a3c...&apos;</span>
                  <br />
                  <span className="pl-4">&#125;</span>
                  <br />
                  <span>&#125;)</span>
                  <br />
                  <span className="pl-2">.</span>
                  <span className="text-[#a78bfa]">then</span>
                  <span>(res =&gt; res.</span>
                  <span className="text-[#60a5fa]">json</span>
                  <span>())</span>
                  <br />
                  <span className="pl-2">.</span>
                  <span className="text-[#a78bfa]">then</span>
                  <span>(data =&gt; console.</span>
                  <span className="text-[#60a5fa]">log</span>
                  <span>(data));</span>
                </div>
              </div>
            </WarpBackground>
          </div>

          {/* Mini Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-32 text-left border-t border-white/[0.08] pt-20">
            <div className="flex flex-col gap-3 backdrop-blur-sm bg-white/[0.01] p-6 rounded-xl border border-white/[0.02]">
              <div className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-white">Instant Latency Control</h3>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">Simulate slow networks, database timeouts, and mobile connections by adding custom delays to each endpoint.</p>
            </div>
            
            <div className="flex flex-col gap-3 backdrop-blur-sm bg-white/[0.01] p-6 rounded-xl border border-white/[0.02]">
              <div className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-white">Full HTTP Methods</h3>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">Support GET, POST, PUT, PATCH, and DELETE mock requests. Retrieve custom HTTP status codes and payloads.</p>
            </div>

            <div className="flex flex-col gap-3 backdrop-blur-sm bg-white/[0.01] p-6 rounded-xl border border-white/[0.02]">
              <div className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-white">Secure Mock Access</h3>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">Toggle projects between public and private. Private mode enforces request verification via API Keys.</p>
            </div>
          </div>
        </main>

        {/* Modern High-End Developer Footer Layout */}
        <footer className="mt-20 border-t border-white/[0.08] bg-[#000000] px-6 py-12 text-[#d4cfc8]">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="max-w-md space-y-3">
                <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2 select-none">
                  <div className="h-5 w-5 rounded bg-white text-black flex items-center justify-center font-extrabold text-xs">
                    M
                  </div>
                  MockForge
                </div>
                <p className="text-sm font-light leading-relaxed text-neutral-400">
                  Keep frontend development moving while backend services are still in progress. 
                  Create mock endpoints, configure responses, simulate latency, and inspect incoming requests seamlessly.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm font-medium">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                {isAuthenticated ? (
                  <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                    <Link href="/register" className="hover:text-white transition-colors font-semibold text-white">Sign Up</Link>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-white/[0.04] w-full" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-neutral-400">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <a 
                  href="mailto:saipraveenamujuri@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 1.99 2H20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Gmail
                </a>

                <a 
                  href="https://github.com/PraveenAmujuri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.9 3.2 9.1 7.6 10.6.6.1.8-.2.8-.6v-2.2c-3.1.7-3.7-1.3-3.7-1.3-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.7-.7 2.1-1.1.1-.7.4-1.1.7-1.4-2.5-.3-5.1-1.3-5.1-5.7 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.6 11.6 0 016.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.6.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.4-2.6 5.4-5.1 5.7.4.3.8 1 .8 2v3c0 .4.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.6C23.1 5.3 18.3.5 12 .5z"/>
                  </svg>
                  GitHub
                </a>

                <a 
                  href="https://linkedin.com/in/sai-praveen-amujuri-738bb4358/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.7H9.1V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4c-1.2 0-2.1-.9-2.1-2.1s.9-2.1 2.1-2.1 2.1.9 2.1 2.1-.9 2.1-2.1 2.1zM7.1 20.4H3.5V9h3.6v11.4z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-neutral-500 text-center sm:text-right">
                <span>&copy; {new Date().getFullYear()} MockForge &middot; Built for developers.</span>
                <span className="hidden sm:inline mx-0.5">&middot;</span>
                <a 
                  href="https://praveenai.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-neutral-300 underline underline-offset-2 transition-colors block sm:inline w-full sm:w-auto mt-1 sm:mt-0"
                >
                  praveenai.tech
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}