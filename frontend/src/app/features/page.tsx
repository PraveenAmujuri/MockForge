"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TunnelTheme } from "@/components/ui/TunnelTheme";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { 
  ArrowRight, 
  Copy, 
  Check, 
  Settings, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  Layers,
  Info,
  Sliders,
  Play
} from "lucide-react";

export default function FeaturesPage() {
  const { checkAuth, isAuthenticated } = useStore();
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<"user" | "order" | "error">("user");
  const [playgroundPath, setPlaygroundPath] = useState("/api/v1/users/42");
  const [playgroundMethod, setPlaygroundMethod] = useState("GET");
  const [playgroundLatency, setPlaygroundLatency] = useState(500);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<{ status: number; body: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleCopyCurl = () => {
    navigator.clipboard.writeText("curl -X GET http://localhost:4000/mock/prod-env/api/v1/users/42");
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handlePlaygroundSend = () => {
    setIsReplaying(true);
    setReplayResult(null);
    setTimeout(() => {
      setIsReplaying(false);
      if (playgroundMethod === "GET") {
        setReplayResult({
          status: 200,
          body: JSON.stringify({
            id: 42,
            uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
            name: "Alexander Pierce",
            email: "alexander.pierce@mockforge.io",
            role: "administrator",
            latency_ms: playgroundLatency,
            timestamp: Date.now()
          }, null, 2)
        });
      } else {
        setReplayResult({
          status: 201,
          body: JSON.stringify({
            status: "success",
            message: "Resource created",
            timestamp: Date.now()
          }, null, 2)
        });
      }
    }, playgroundLatency);
  };

  const templates = {
    user: {
      template: `{
  "id": "{{request.params.id}}",
  "uuid": "{{uuid}}",
  "name": "{{faker.person.fullName}}",
  "email": "{{faker.internet.email}}",
  "status": "active"
}`,
      resolved: `{
  "id": "42",
  "uuid": "79b3ea2b-9fca-44a5-9273-04b39178cc02",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "status": "active"
}`
    },
    order: {
      template: `{
  "orderId": "{{randomInt(1000, 9999)}}",
  "amount": "{{randomInt(50, 500)}}",
  "currency": "USD",
  "timestamp": "{{timestamp}}"
}`,
      resolved: `{
  "orderId": "4892",
  "amount": "237",
  "currency": "USD",
  "timestamp": "1783992019"
}`
    },
    error: {
      template: `{
  "error": "UNAUTHORIZED",
  "message": "Missing key in headers",
  "reference": "{{uuid}}"
}`,
      resolved: `{
  "error": "UNAUTHORIZED",
  "message": "Missing key in headers",
  "reference": "9c1b3f9b-640a-4bf7-a3f2-ef49195b0373"
}`
    }
  };

  const fontStack = "'Inter Variable', ui-sans-serif, system-ui, -apple-system, sans-serif";

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-[#000000] text-foreground transition-colors duration-300 tracking-normal antialiased relative overflow-x-hidden selection:bg-blue-600/30"
      style={{ fontFamily: fontStack }}
    >
      
      {/* Background theme */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen w-full h-full overflow-hidden">
        <TunnelTheme />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 space-y-36 md:space-y-48">
          
          {/* SECTION 1: HERO */}
          <section className="text-center space-y-10 py-12 md:py-20 relative z-10">
            <ScrollReveal direction="up" duration={0.7} delay={0.1}>
              <div className="space-y-6 max-w-4xl mx-auto">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold uppercase tracking-tighter bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent leading-[0.9] sm:leading-[0.95]">
                  Mock REST APIs <br />
                  For Rapid Integration.
                </h1>
                <p className="text-sm sm:text-base md:text-lg font-light text-neutral-400 max-w-2xl mx-auto leading-relaxed px-4">
                  Frontend developers shouldn&apos;t wait for backend infrastructure. MockForge gives you complete control over REST route creation, templating parameters, and latency rules.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" duration={0.7} delay={0.25}>
              <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-center pt-2">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group shadow-[0_0_25px_rgba(37,99,235,0.15)] hover:shadow-[0_0_35px_rgba(37,99,235,0.35)] active:scale-95"
                >
                  Start Building
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/docs"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center text-white active:scale-95"
                >
                  Read Documentation
                </Link>
              </div>
            </ScrollReveal>

            {/* Overlapping perspective card with top highlight & radial glow */}
            <ScrollReveal direction="up" duration={0.8} delay={0.4} className="relative pt-16 max-w-4xl mx-auto px-2 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative rounded-xl border border-white/[0.08] border-t-white/[0.15] bg-[#050507] p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 transform hover:-translate-y-1 hover:border-white/[0.12]">
                <div className="bg-[#0a0a0c] border border-white/[0.05] rounded-lg p-4 sm:p-6 text-left space-y-4">
                  {/* Clean curation of the Endpoint Builder Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] sm:text-[10px] font-bold rounded font-mono uppercase tracking-wider">
                        GET
                      </span>
                      <span className="text-xs sm:text-sm font-mono text-white font-semibold">
                        /api/v1/users/:id/profile
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] sm:text-[10px] font-mono bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded text-neutral-400">
                        Content-Type: application/json
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400">
                        Delay: 1500ms
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Custom Headers</span>
                      <div className="bg-[#050507] border border-white/[0.05] rounded p-2.5 text-[10px] font-mono text-neutral-300">
                        Access-Control-Allow-Origin: *
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Response Body Template</span>
                      <pre className="bg-[#050507] border border-white/[0.05] rounded p-3 text-[10px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                        {`{\n  "id": "{{request.params.id}}",\n  "uuid": "{{uuid}}",\n  "name": "{{faker.person.fullName}}"\n}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* SECTION 2: THE Friction (STORYTELLING COMPARISON) */}
          <section className="space-y-12 border-t border-white/[0.08] pt-20">
            <ScrollReveal direction="up" duration={0.6}>
              <div className="max-w-4xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block mb-4">
                  DEVELOPER PAIN POINT
                </span>
                <p className="text-2xl sm:text-4xl text-neutral-300 tracking-tight font-light font-sans max-w-4xl leading-snug">
                  &ldquo;We spent weeks writing placeholder server routes and syncing configurations across client repos. MockForge cuts that latency down to zero.&rdquo;
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" duration={0.6} delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#050507] border border-white/[0.04] p-6 rounded-xl space-y-3 relative overflow-hidden transition-all duration-300 hover:border-white/[0.08]">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 blur-2xl rounded-full" />
                  <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest block font-bold">The Slow Way</span>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                    Frontend teams wait for backends to design database schemas, configure containers, and deploy dev builds. Any schema update triggers local code changes and communication overhead.
                  </p>
                </div>

                <div className="bg-[#050507] border border-white/[0.08] p-6 rounded-xl space-y-3 relative overflow-hidden transition-all duration-300 hover:border-white/[0.12]">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 blur-2xl rounded-full" />
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">The MockForge Flow</span>
                  <p className="text-xs sm:text-sm text-white leading-relaxed font-light">
                    Scaffold route structures on MockForge in seconds. Frontend developers design, test, and run client calls in parallel, syncing with standard schema specs immediately.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* SECTION 3: SHOWCASE - THE ENDPOINT STUDIO */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/[0.08] pt-20 items-center">
            <div className="md:col-span-5 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">
                ENDPOINT DESIGNER
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                Curate every HTTP scenario.
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Configure HTTP actions, return customized response headers, pick output formats, and copy dynamic testing commands straight from the table view.
              </p>
            </div>

            <div className="md:col-span-7 border border-white/[0.06] bg-[#050507] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/[0.1]">
              <div className="bg-[#0a0a0c] px-4 py-3.5 border-b border-white/[0.05] flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Endpoint Designer
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.01] text-neutral-500">
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Path Route</th>
                      <th className="p-3.5">Content-Type</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded">GET</span>
                      </td>
                      <td className="p-3.5 text-white font-semibold">/api/v1/users/:id/profile</td>
                      <td className="p-3.5 text-neutral-400">application/json</td>
                      <td className="p-3.5 text-right">
                        <button onClick={handleCopyCurl} className="px-2 py-1 bg-white/[0.03] border border-white/[0.08] rounded text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-all inline-flex items-center gap-1.5 active:scale-95">
                          {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy cURL
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold rounded">POST</span>
                      </td>
                      <td className="p-3.5 text-white font-semibold">/api/v1/orders/checkout</td>
                      <td className="p-3.5 text-neutral-400">application/json</td>
                      <td className="p-3.5 text-right">
                        <button className="px-2 py-1 bg-white/[0.03] border border-white/[0.08] rounded text-neutral-300 hover:text-white transition-all">Edit Route</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 4: SHOWCASE - DYNAMIC TEMPLATE RESOLUTION */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/[0.08] pt-20 items-center">
            <div className="md:col-span-5 md:order-2 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">
                TEMPLATE ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                Make mocks behave like a real backend.
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Define response templates utilizing double-bracket parameters. Inject path variable parameters, request query configurations, timestamps, UUID values, or complete identities using our integrated Faker bindings.
              </p>
              
              {/* Tab Selector Buttons */}
              <div className="flex gap-2 border-b border-white/[0.05] pb-2">
                {(["user", "order", "error"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTemplateTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all border ${
                      activeTemplateTab === tab 
                        ? "bg-white/[0.05] border-white/[0.08] text-white font-semibold" 
                        : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab === "user" && "User"}
                    {tab === "order" && "Order"}
                    {tab === "error" && "Error"}
                  </button>
                ))}
              </div>
            </div>

            {/* Side-by-side template editor comparison */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:order-1">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Monaco Template Code</span>
                <pre className="bg-[#050507] border border-white/[0.06] rounded-xl p-4 text-[10px] font-mono text-neutral-300 overflow-y-auto leading-relaxed h-[200px]">
                  {templates[activeTemplateTab].template}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Resolved JSON Payload</span>
                <pre className="bg-[#050507] border border-white/[0.08] rounded-xl p-4 text-[10px] font-mono text-emerald-400 overflow-y-auto leading-relaxed h-[200px] shadow-lg">
                  {templates[activeTemplateTab].resolved}
                </pre>
              </div>
            </div>
          </section>

          {/* SECTION 5: SHOWCASE - LIVE LOGS & PLAYGROUND */}
          <section className="space-y-8 border-t border-white/[0.08] pt-16">
            <div className="space-y-4 max-w-3xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">
                SSE DIAGNOSTICS &amp; REPLAY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                Diagnostics and Request Replayer.
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Connect your mock routes to caller applications and monitor incoming calls in real-time. Use the logs request replayer sandbox to modify paths, methods, or bodies and send test dispatches instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Logs checklist pane */}
              <div className="md:col-span-5 bg-[#050507] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span>Captured Logs (SSE Feed)</span>
                    <span className="text-emerald-500 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Stream
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-1 font-mono text-[11px] cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px]">GET</span>
                        <span className="text-[10px] text-neutral-500">Just Now</span>
                      </div>
                      <div className="text-white font-semibold">/api/v1/users/42</div>
                      <div className="text-[10px] text-neutral-500">IP: 192.168.1.45 &middot; Status: 200</div>
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] space-y-1 font-mono text-[11px] opacity-70">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold text-[9px]">POST</span>
                        <span className="text-[10px] text-neutral-500">2m ago</span>
                      </div>
                      <div className="text-neutral-300">/api/v1/orders/checkout</div>
                      <div className="text-[10px] text-neutral-500">IP: 192.168.1.45 &middot; Status: 201</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.05] pt-3 text-[10px] text-neutral-500 font-mono italic">
                  Click log card to load payload details into the Playground.
                </div>
              </div>

              {/* Replayer Sandbox pane */}
              <div className="md:col-span-7 bg-[#050507] border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span>Request Replay Playground</span>
                    <span className="text-indigo-400">Sandbox Overlay</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <label className="block text-[9px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Method</label>
                      <select
                        value={playgroundMethod}
                        onChange={(e) => setPlaygroundMethod(e.target.value)}
                        className="w-full h-8 rounded border border-white/[0.08] bg-[#0c0c0e] px-2 py-1 text-xs text-foreground font-mono outline-none cursor-pointer"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                    <div className="col-span-8">
                      <label className="block text-[9px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Path</label>
                      <input
                        type="text"
                        value={playgroundPath}
                        onChange={(e) => setPlaygroundPath(e.target.value)}
                        className="w-full h-8 rounded border border-white/[0.08] bg-[#0c0c0e] px-3 py-1 text-xs text-foreground font-mono outline-none input-premium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest">Simulated Delay</span>
                      <span className="text-[10px] font-mono text-amber-400">{playgroundLatency}ms</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="100"
                      value={playgroundLatency}
                      onChange={(e) => setPlaygroundLatency(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/[0.06] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlaygroundSend}
                    disabled={isReplaying}
                    className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow active:scale-[0.98]"
                  >
                    {isReplaying && <span className="h-3 w-3 rounded-full border border-black border-t-transparent animate-spin" />}
                    Send / Replay Request
                  </button>

                  {/* Replay Result Panel */}
                  <div className="bg-[#0a0a0c] border border-white/[0.05] rounded-lg p-3 min-h-[100px] flex flex-col justify-center">
                    {isReplaying ? (
                      <div className="text-center text-xs text-neutral-500 italic font-mono py-4">Resolving mock payload...</div>
                    ) : replayResult ? (
                      <div className="space-y-2 font-mono text-[10px]">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                          <span className="text-neutral-500 uppercase">Response Code</span>
                          <span className="text-emerald-400 font-bold">{replayResult.status} OK</span>
                        </div>
                        <pre className="text-neutral-300 leading-normal overflow-x-auto max-h-24">
                          {replayResult.body}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-neutral-500 italic font-mono py-4">No request sent. Click Send above.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: SHOWCASE - OPENAPI SPEC PROVISIONING */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/[0.08] pt-20 items-center">
            <div className="md:col-span-5 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">
                SPEC IMPORT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                Mocks from specs in seconds.
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Drag and drop Swagger v2 or OpenAPI v3 YAML/JSON files directly. Preview routes, parse payloads, and batch provision endpoints in one click.
              </p>
            </div>

            {/* Real-inspired OpenAPI checklists widget */}
            <div className="md:col-span-7 bg-[#050507] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/[0.1]">
              <div className="bg-[#0a0a0c] px-4 py-3.5 border-b border-white/[0.05] flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>OpenAPI Spec Parser Output</span>
                <span className="text-amber-400 font-bold">4 routes parsed</span>
              </div>
              
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                  <input type="checkbox" defaultChecked className="accent-indigo-500 rounded cursor-pointer" />
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded">GET</span>
                  <span className="text-white font-semibold">/api/v1/products</span>
                  <span className="ml-auto text-[10px] text-neutral-500 italic">Example parsed</span>
                </div>

                <div className="flex items-center gap-3 p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                  <input type="checkbox" defaultChecked className="accent-indigo-500 rounded cursor-pointer" />
                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold rounded">POST</span>
                  <span className="text-white font-semibold">/api/v1/products</span>
                  <span className="ml-auto text-[10px] text-neutral-500 italic">Traversed Schema</span>
                </div>

                <button className="w-full py-2 bg-white text-black text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
                  Provision Checked Endpoints (2)
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 7: SHOWCASE - SETTINGS & SECURITY */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/[0.08] pt-20 items-center">
            <div className="md:col-span-5 md:order-2 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold block">
                CORS &amp; VARIABLES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                Custom CORS rules and environments.
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Establish global key-value configuration variables to access variables inside any routing resolver body. Configure specific allowed origins, methods, and credential policies to bypass browser security restrictions.
              </p>
            </div>

            {/* Recreated settings layout form */}
            <div className="md:col-span-7 md:order-1 bg-[#050507] border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:border-white/[0.1] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>Project Settings Config</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase block tracking-widest">CORS Origin Header</span>
                  <input
                    type="text"
                    readOnly
                    value="http://localhost:3000, https://app.mockforge.io"
                    className="w-full h-8 rounded border border-white/[0.08] bg-[#0c0c0e] px-2 py-1 text-xs text-neutral-300 outline-none"
                  />
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase block tracking-widest">Environment Variables</span>
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input type="text" readOnly value="API_VERSION" className="w-1/2 h-7 rounded border border-white/[0.08] bg-[#0c0c0e] px-2 text-[10px] text-neutral-400" />
                      <input type="text" readOnly value="v1" className="w-1/2 h-7 rounded border border-white/[0.08] bg-[#0c0c0e] px-2 text-[10px] text-neutral-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: FINAL CTA */}
          <section className="border-t border-white/[0.08] pt-24 text-center space-y-10">
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]">
                Bring speed back <br /> to your integration loops.
              </h2>
              <p className="text-sm md:text-base font-light text-neutral-400 max-w-md mx-auto leading-relaxed">
                Join developers using MockForge to prototype interfaces, resolve CORS, and run API playground tests in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-center">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-lg"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-3.5 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors active:scale-95"
              >
                Read Documentation
              </Link>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
