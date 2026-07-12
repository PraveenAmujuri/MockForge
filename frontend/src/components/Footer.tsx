"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export function Footer() {
  const { checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-[#000000] px-4 sm:px-6 py-12 text-[#d4cfc8] w-full relative z-10">
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

          <div className="flex flex-wrap gap-x-6 sm:gap-x-12 gap-y-4 text-sm font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-neutral-400 w-full">
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

          <div className="flex flex-wrap items-center justify-center gap-1 text-neutral-500 text-center sm:text-right">
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
  );
}
