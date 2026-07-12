"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TunnelTheme } from "@/components/ui/TunnelTheme";
import { 
  FileCode2, 
  Terminal, 
  Layers, 
  RefreshCw, 
  ArrowRight, 
  Play, 
  Code2, 
  Sliders, 
  FolderSync, 
  Cpu
} from "lucide-react";

export default function FeaturesPage() {
  const { checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#000000] text-foreground transition-colors duration-150 tracking-normal antialiased relative overflow-x-hidden selection:bg-blue-600/30">
      
      {/* Background theme */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen w-full h-full overflow-hidden">
        <TunnelTheme />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Platform Features
            </h1>
            <p className="text-sm sm:text-base font-light text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Explore the factually fully-implemented capabilities of the MockForge API sandbox. No placeholders, no simulations—just pure mock power.
            </p>
          </div>

          {/* Handcrafted Section 1: Endpoint Designer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/[0.08] pt-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-neutral-400">
                <Sliders className="w-3 h-3 text-indigo-400" />
                API Designer
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                Advanced Endpoint Designer
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Design mock API nodes matching standard HTTP methodologies. Pick custom HTTP status codes and configure latency profiles to simulate high-load conditions or packet delays.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  GET, POST, PUT, PATCH, DELETE operations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  Formats: JSON, XML, HTML, and Plain Text
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  Custom Response Headers per route configuration
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  Visual categorizations via tags and label filters
                </li>
              </ul>
            </div>

            <div className="border border-white/[0.08] bg-[#050507] rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-xs text-neutral-400 font-mono">
                <span>Configure Endpoint</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                    <span className="text-[10px] text-neutral-500 block uppercase">Method</span>
                    <span className="font-bold text-sky-400 font-mono">GET</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                    <span className="text-[10px] text-neutral-500 block uppercase">Status</span>
                    <span className="font-bold text-emerald-400 font-mono">200 OK</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg">
                    <span className="text-[10px] text-neutral-500 block uppercase">Delay</span>
                    <span className="font-bold text-amber-400 font-mono">1500ms</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg space-y-1 font-mono">
                  <span className="text-[10px] text-neutral-500 block uppercase">Custom Headers</span>
                  <div className="text-[11px] text-neutral-300">Cache-Control: no-cache</div>
                  <div className="text-[11px] text-neutral-300">Access-Control-Allow-Origin: *</div>
                </div>
              </div>
            </div>
          </div>

          {/* Handcrafted Section 2: Dynamic Template Interpolation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/[0.08] pt-12 md:flex-row-reverse">
            <div className="md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-neutral-400">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Template Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                Dynamic Request Interpolation
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Make your mock nodes behave like a real backend. Interpolate headers, query params, request bodies, or path parameters into response schemas on the fly.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Path segment variables matching (e.g. <code className="text-[11px] text-white">/users/:id</code>)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Query, body, header interpolation via <code className="text-[11px] text-white">{"{{request.query.param}}"}</code>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Project variables binding via <code className="text-[11px] text-white">{"{{project.API_URL}}"}</code>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Built-in helpers: <code className="text-[11px] text-white">{"{{uuid}}"}</code>, <code className="text-[11px] text-white">{"{{timestamp}}"}</code>, <code className="text-[11px] text-white">{"{{randomInt(1,99)}}"}</code>
                </li>
              </ul>
            </div>

            <div className="md:order-1 border border-white/[0.08] bg-[#050507] rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-xs text-neutral-400 font-mono">
                <span>Response Template Preview</span>
                <span className="text-indigo-400">faker-js parser</span>
              </div>
              <pre className="font-mono text-[11px] bg-[#0a0a0c] text-neutral-300 p-4 rounded-lg overflow-x-auto leading-relaxed border border-white/[0.03]">
                <span className="text-neutral-500">&#123;</span><br />
                <span>  &quot;id&quot;: </span><span className="text-amber-400">&quot;{"{{request.params.id}}"}&quot;</span><span>,</span><br />
                <span>  &quot;uuid&quot;: </span><span className="text-amber-400">&quot;{"{{uuid}}"}&quot;</span><span>,</span><br />
                <span>  &quot;greeting&quot;: </span><span className="text-amber-400">&quot;Hello {"{{request.query.name}}"}&quot;</span><span>,</span><br />
                <span>  &quot;email&quot;: </span><span className="text-amber-400">&quot;{"{{faker.internet.email}}"}&quot;</span><br />
                <span className="text-neutral-500">&#125;</span>
              </pre>
            </div>
          </div>

          {/* Handcrafted Section 3: Diagnostic logs & Request Replay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/[0.08] pt-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-neutral-400">
                <Play className="w-3 h-3 text-rose-400" />
                Diagnostics
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                Real-Time Logs & Replay Playground
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Audit and debug client calls in real-time. Use Server-Sent Events to stream client queries directly to your console, inspect caller details, and trigger sandbox replays.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  SSE-driven real-time log dispatch stream pipeline
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Detailed headers, payload, and origin IP monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Replay Playground: tweak headers/body, and re-send instantly
                </li>
              </ul>
            </div>

            <div className="border border-white/[0.08] bg-[#050507] rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-xs text-neutral-400 font-mono">
                <span>Playground Replayer Sandbox</span>
                <span className="text-rose-400 font-bold">1 Click Dispatch</span>
              </div>
              <div className="bg-[#0a0a0c] p-3 rounded-lg border border-white/[0.03] space-y-2 font-mono text-xs">
                <div className="flex gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">POST</span>
                  <span className="text-neutral-400 font-semibold truncate">/api/users/123/profile</span>
                </div>
                <div className="text-[10px] text-neutral-500">HEADERS</div>
                <div className="bg-black/40 p-1.5 rounded border border-white/[0.02] text-[10px] text-neutral-400">
                  x-api-key: mf_live_9f8a3c...<br />
                  Content-Type: application/json
                </div>
                <div className="text-[10px] text-neutral-500">REPLAY LOG PAYLOAD</div>
                <div className="bg-black/40 p-1.5 rounded border border-white/[0.02] text-[10px] text-neutral-400 text-ellipsis overflow-hidden">
                  {"{ \"role\": \"admin\" }"}
                </div>
              </div>
            </div>
          </div>

          {/* Handcrafted Section 4: Spec Import/Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/[0.08] pt-12">
            <div className="md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-neutral-400">
                <FolderSync className="w-3 h-3 text-amber-400" />
                Spec Tooling
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                OpenAPI Spec Importer & Exporter
              </h2>
              <p className="text-sm font-light text-neutral-400 leading-relaxed">
                Scaffold APIs rapidly. Drag-and-drop OpenAPI v3/Swagger v2 schemas (JSON/YAML) to selectively create mock projects, or export configurations with custom parameters in seconds.
              </p>
              <ul className="space-y-2 text-xs font-mono text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Selective batch endpoint creation from OpenAPI spec files
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Export your mock setup as standard OpenAPI v3 specification JSON
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Bulk actions: checkboxes to delete or export multiple endpoints
                </li>
              </ul>
            </div>

            <div className="md:order-1 border border-dashed border-white/[0.15] bg-white/[0.01] rounded-2xl p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-neutral-400">
                <FolderSync className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-white">Drag &amp; Drop OpenAPI Spec</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">Supports swagger.json, openapi.yaml, or mockforge-export.json configurations.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-t border-white/[0.08] pt-16 text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
              Ready to accelerate frontend builds?
            </h3>
            <p className="text-xs sm:text-sm font-light text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Create a free sandbox account now and build REST mock endpoints immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 shadow-md"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/docs"
                className="px-6 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] text-xs sm:text-sm font-semibold transition-colors text-white"
              >
                Read Docs
              </Link>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
