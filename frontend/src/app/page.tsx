"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Terminal, Layers, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const { checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-lg select-none">
              M
            </div>
            <span className="font-semibold text-lg tracking-tight">MockForge</span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-8 border border-border/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Mocking Engine v1.0 Live
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          Mock REST APIs <br />Before they are built.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Don&apos;t let unfinished backend services block your frontend. Instantly create mock endpoints, customize responses, simulate latency, and integrate directly into your apps.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="px-6 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-95 transition-all flex items-center justify-center gap-2 group shadow-sm"
          >
            Start Mocking Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 rounded-lg border border-border bg-card/40 hover:bg-secondary font-medium transition-all text-sm flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>

        {/* Code Preview Section */}
        <div className="w-full max-w-3xl rounded-xl border border-border/80 bg-card/50 overflow-hidden shadow-2xl">
          <div className="bg-secondary/40 px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">App.tsx</span>
          </div>
          <div className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto bg-[#0a0a0c] text-neutral-300">
            <span className="text-[#a78bfa]">fetch</span>
            <span>(</span>
            <span className="text-[#34d399]">&apos;https://mockforge.com/mock/my-app/api/products&apos;</span>
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

        {/* Mini Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24 text-left border-t border-border/40 pt-16">
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary text-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-lg">Instant Latency Control</h3>
            <p className="text-sm text-muted-foreground">Simulate slow networks, database timeouts, and mobile connections by adding custom delays to each endpoint.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary text-primary flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-lg">Full HTTP Methods</h3>
            <p className="text-sm text-muted-foreground">Support GET, POST, PUT, PATCH, and DELETE mock requests. Retrieve custom HTTP status codes and payloads.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary text-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-lg">Secure Mock Access</h3>
            <p className="text-sm text-muted-foreground">Toggle projects between public and private. Private mode enforces request verification via API Keys.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm gap-4">
          <span>&copy; {new Date().getFullYear()} MockForge. Built for developers.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
