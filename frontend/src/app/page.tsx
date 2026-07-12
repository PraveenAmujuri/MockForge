"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Terminal, Layers, Shield, Zap, ArrowRight } from "lucide-react";
import { WarpBackground } from "@/components/ui/warp-background";
import { TunnelTheme } from "@/components/ui/TunnelTheme"; 
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Home() {
  const { checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    // FIXED: Force hard horizontal overflow isolation at the global root level
    <div className="min-h-screen w-full flex flex-col bg-[#000000] text-foreground transition-colors duration-150 tracking-normal antialiased relative overflow-x-hidden selection:bg-blue-600/30">
      
      {/* FIXED BACKDROP TUNNEL LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen w-full h-full overflow-hidden">
        <TunnelTheme />
      </div>

      {/* INTERACTIVE CONTENT VIEW WRAPPER */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* Navbar */}
        <Navbar />

        {/* Main Hero Content */}
        {/* FIXED: Rebalanced structural max-width bounds and added strict horizontal viewport containment */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 pt-20 md:pt-32 pb-24 w-full max-w-5xl mx-auto text-center overflow-hidden">

          {/* FIXED: Fluid font downscaling (text-3xl scaling up dynamically to text-7xl) prevents word breaking over screen limits */}
          <ScrollReveal direction="up" duration={0.7} delay={0.1}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl tracking-tight max-w-4xl mb-6 md:mb-8 flex flex-col gap-1 md:gap-2 w-full break-words">
              <span className="font-black bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent uppercase tracking-wide">
                Mock REST APIs
              </span>
              <span className="font-light text-neutral-400 text-2xl sm:text-4xl md:text-6xl tracking-wide mt-1">
                For Rapid Integration.
              </span>
            </h1>
          </ScrollReveal>

          {/* Sub-headline */}
          <ScrollReveal direction="up" duration={0.7} delay={0.2}>
            <p className="text-sm md:text-lg font-light text-neutral-400/90 max-w-2xl mb-10 md:mb-14 leading-relaxed tracking-wide px-2 sm:px-4">
              Build, test, and run your frontend applications independently. Generate dynamic response templates, configure custom CORS policies, simulate latency, and inspect or replay captured request payloads directly.
            </p>
          </ScrollReveal>

          {/* Action Button Interface Links */}
          {/* FIXED: Optimized full-width call-to-actions that gracefully fold on tiny portrait widths */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-16 md:mb-24 items-center justify-center w-full sm:w-auto px-4 sm:px-0">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group shadow-[0_0_25px_rgba(37,99,235,0.15)] hover:shadow-[0_0_35px_rgba(37,99,235,0.35)]"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] font-medium text-sm transition-all flex items-center justify-center text-white shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:border-white/[0.15]"
            >
              Explore Features
            </Link>
          </div>

          {/* Code Preview Section wrapped with Warp Tunnel */}
          {/* FIXED: Enforced strict max-w boundaries on the terminal grid card layer */}
          {/* Code Preview Section wrapped with Warp Tunnel */}
          {/* FIXED: Enforced strict max-w boundaries on the terminal grid card layer */}
          <ScrollReveal direction="up" duration={0.8} delay={0.3} className="w-full max-w-full md:max-w-3xl mt-4 overflow-hidden px-1 sm:px-0">
            <WarpBackground 
              perspective={180}
              beamsPerSide={4} 
              beamDuration={4}
              className="w-full rounded-2xl border border-white/[0.05] bg-[#030303] p-4 sm:p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              {/* Inner Terminal Container Card */}
              <div className="w-full rounded-xl border border-white/[0.08] overflow-hidden bg-[#0a0a0c] shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-full">
                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">App.tsx</span>
                </div>

                {/* FIXED: Enforced code line text wrapping parameters to keep string bodies nested completely on standard mobile panels */}
                <div className="p-4 sm:p-6 text-left font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-[#050507] text-neutral-300 whitespace-pre-wrap break-all md:break-normal">
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
          </ScrollReveal>

          {/* Mini Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mt-24 md:mt-32 text-left border-t border-white/[0.08] pt-16 md:pt-20">
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

        <Footer />
      </div>
    </div>
  );
}