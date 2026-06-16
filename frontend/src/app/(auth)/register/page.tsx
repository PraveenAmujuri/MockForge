"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { register, isLoadingAuth, authError, checkAuth, isAuthenticated } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const success = await register(email, password);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="h-10 w-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xl mb-4 select-none">
            M
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Get started with MockForge today</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(localError || authError) && (
              <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                {localError || authError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingAuth}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoadingAuth}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoadingAuth}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {isLoadingAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
