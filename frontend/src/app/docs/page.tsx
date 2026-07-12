"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TunnelTheme } from "@/components/ui/TunnelTheme";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Terminal,
  Download,
  Sliders,
  Cpu,
  RefreshCw,
  X,
  LayoutGrid,
  Search,
  Check,
  Copy,
  Info,
  AlertTriangle,
  Lock,
  Layers,
  Compass,
  ArrowRight
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Subsection {
  title: string;
  text?: string;
  items?: string[];
}

interface TimelinePhase {
  date: string;
  title: string;
  status: string;
  icon: React.ReactNode;
  desc: string;
  diagram?: string;
  details?: string[];
}

interface FaqItem {
  q: string;
  a: string;
}

interface CodeSample {
  title: string;
  code: string;
}

interface DocSectionContent {
  heading: string;
  body: string | null;
  subsections?: Subsection[];
  timeline?: TimelinePhase[];
  faqs?: FaqItem[];
  codeSample?: CodeSample;
}

interface DocSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  content: DocSectionContent;
}

const DOWNLOAD_URL = "/dashboard";

/* ─────────────────────────────────────────────────────────────────────────
 *  Navigation sections for the sidebar
 * ───────────────────────────────────────────────────────────────────────── */
const DOC_SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    label: "Getting started",
    icon: ChevronRight,
    content: {
      heading: "Getting started",
      body: "MockForge is an enterprise-grade platform that enables frontend teams to design, manage, and test mock REST APIs locally or inside a secure relational cluster. Accelerate integration workflows before backends are built.",
      subsections: [
        {
          title: "Introduction",
          text: "MockForge runs as a SaaS application with direct dashboard access. Sign up for a free developer account to set up your initial project sandbox and define endpoint definitions immediately.",
        },
        {
          title: "System requirements",
          items: [
            "Any modern web browser (Chrome, Firefox, Safari, Edge)",
            "Active internet connection to sync mock logs with the cloud",
            "Support for CORS credentials (if making requests from web applications)",
          ],
        },
        {
          title: "Quick start",
          text: "Launch the dashboard. Click 'New Project' and enter your project slug. Click 'Add Endpoint' inside the project view to define method type, path segments, and response body templates. Query your endpoint under the resolved address format immediately.",
        },
      ],
    },
  },
  {
    id: "authentication",
    label: "Authentication",
    icon: Lock,
    content: {
      heading: "Authentication & Keys",
      body: "Protect your mock API environments using project-level keys and route access settings.",
      subsections: [
        {
          title: "Access control modes",
          text: "Projects can be set to either Public or Private mode. Public mode allows anonymous requests to your mock URLs. Private mode rejects all incoming requests that do not present a valid token in the headers.",
        },
        {
          title: "Setting authorization headers",
          text: "In Private Mode, client requests must supply the project-level API Key inside the X-API-Key HTTP header. The resolver service evaluates this token on every incoming request and triggers a 401 Unauthorized response if missing or mismatching.",
        },
      ],
      codeSample: {
        title: "Querying a Private Mock Endpoint",
        code: `curl -X GET "http://localhost:4000/mock/my-project/api/users" \\
  -H "X-API-Key: mf_live_9f8a3c8d7e6f5a4b3c2d1e"`
      }
    },
  },
  {
    id: "project-settings",
    label: "Settings & CORS",
    icon: Sliders,
    content: {
      heading: "Project Settings",
      body: "Control CORS policies, configure global environment variables, and manage project imports/exports.",
      subsections: [
        {
          title: "Custom CORS configuration",
          text: "Configure allowed origins, allowed methods, allowed headers, and allow credentials fields per project to ensure your mock endpoints fit client browser origin checks without triggering CORS preflight errors.",
        },
        {
          title: "Environment variables",
          text: "Define key-value pairs at the project scope. Environment variables are useful to parameterize hosts, API versions, or static tokens, and can be evaluated inside any response body using the {{project.VARIABLE_NAME}} syntax.",
        },
        {
          title: "Backup & Portability",
          text: "Export your entire project setup (endpoints, variables, rules, CORS configuration) as a single JSON file. You can import this JSON file into any other MockForge workspace to instantly clone the environment.",
        },
      ],
    },
  },
  {
    id: "response-formats",
    label: "Response formats",
    icon: Layers,
    content: {
      heading: "Payload Formats",
      body: "MockForge lets you define custom mock response formats and attach custom HTTP headers to each endpoint.",
      subsections: [
        {
          title: "Content-Type selection",
          text: "Choose between JSON, XML, HTML, and Plain Text output modes. The integrated code editor automatically shifts syntax highlighting and format linting based on the selected content type.",
        },
        {
          title: "Raw text bodies",
          text: "Need to mock an HTML template page or an XML webhook response? Write raw payload content directly in the text editor to bypass default JSON formatting constraints.",
        },
        {
          title: "Custom response headers",
          text: "Define arbitrary HTTP headers (e.g. Cache-Control: no-cache, X-Mocked-By: MockForge) to return with every successful response.",
        },
      ],
    },
  },
  {
    id: "templating-engine",
    label: "Templating engine",
    icon: Cpu,
    content: {
      heading: "Dynamic Templates",
      body: "MockForge evaluates templates at resolution time, enabling mock responses to contain dynamic values matching client inputs.",
      subsections: [
        {
          title: "Dynamic path parameters",
          text: "Register dynamic routes using Express-style (:id) or OpenAPI-style ({id}) wildcard variables (e.g. /users/:id/profile). The parameter values are extracted and made accessible inside response bodies.",
        },
        {
          title: "Request context variables",
          text: "Interpolate incoming values using double brackets: {{request.query.param}}, {{request.body.field}}, {{request.headers.header_name}}, or {{request.params.param_name}}.",
        },
        {
          title: "Helper functions",
          text: "Generate dummy data using built-in helpers: {{uuid}} for random UUIDs, {{timestamp}} for current Unix timestamps, {{now}} for ISO date strings, and {{randomInt(min,max)}} for integers.",
        },
        {
          title: "Faker.js integration",
          text: "Synthesize full identity parameters natively. Supports all standard Faker parameters: {{faker.person.fullName}}, {{faker.internet.email}}, {{faker.phone.number}}.",
        },
      ],
      codeSample: {
        title: "Dynamic JSON Template Example",
        code: `{
  "id": "{{request.params.id}}",
  "uuid": "{{uuid}}",
  "name": "{{faker.person.fullName}}",
  "ip": "{{request.headers.x-forwarded-for}}",
  "created_at": "{{now}}"
}`
      }
    },
  },
  {
    id: "diagnostics",
    label: "Logs & Playground",
    icon: RefreshCw,
    content: {
      heading: "Diagnostics & Replay",
      body: "Inspect client requests in real-time and run quick replays.",
      subsections: [
        {
          title: "Real-time SSE logs",
          text: "The request history logs use Server-Sent Events (SSE) to sync with the mock resolver instantly. Whenever a client triggers your mock paths, the request method, route, origin IP, and payload flash in the table in real-time.",
        },
        {
          title: "Replay Playground",
          text: "Open any log detail, switch to the Playground tab, modify the method/path/headers/body parameters, and re-send the request immediately to audit mock behaviors inside your browser sandbox.",
        },
      ],
    },
  },
  {
    id: "openapi",
    label: "OpenAPI Spec",
    icon: Terminal,
    content: {
      heading: "OpenAPI Spec Integration",
      body: "Import and export industry-standard API specifications directly.",
      subsections: [
        {
          title: "Drag-and-Drop Spec Importer",
          text: "Drag and drop standard Swagger v2 or OpenAPI v3 YAML/JSON files onto the dashboard. MockForge parses paths, methods, parameters, and payloads automatically, letting you cherry-pick routes to batch-provision endpoints.",
        },
        {
          title: "OpenAPI v3 spec export",
          text: "Download a standard OpenAPI v3 specification JSON file from your project settings to document or port your mocked route definitions to other environments.",
        },
      ],
    },
  },
  {
    id: "engineering-journey",
    label: "Engineering journey",
    icon: Compass,
    content: {
      heading: "Engineering journey",
      body: "Trace the architectural milestones, features integration, and operational pivots during the creation of MockForge.",
      timeline: [
        {
          date: "Milestone 1",
          title: "Relational Mock Engine",
          status: "Completed",
          icon: <Terminal size={14} />,
          desc: "Designed the foundational database mapping Projects, Endpoints, and Request Logs. Configured core REST route matchers to render customizable mock responses.",
          details: [
            "Built project containers supporting GET, POST, PUT, PATCH, DELETE operations.",
            "Designed a dedicated path matcher to parse incoming request routes."
          ]
        },
        {
          date: "Milestone 2",
          title: "Rules Evaluator & Faker",
          status: "Completed",
          icon: <ChevronRight size={14} className="rotate-90" />,
          desc: "Added scenario builders and comparison operators. Built rules parsing layers (EQUALS, CONTAINS, EXISTS, REGEX) to serve distinct payloads based on client values.",
          details: [
            "Sequenced scenario processing (first matching rule returns response).",
            "Bound on-the-fly Faker.js template rendering inside scenario structures."
          ]
        },
        {
          date: "Milestone 3",
          title: "Live Event Stream Logger",
          status: "Completed",
          icon: <RefreshCw size={14} />,
          desc: "Configured Server-Sent Events (SSE) log pipelines to dispatch incoming mock requests instantly to caller dashboards without high network polling cost.",
          details: [
            "Setup RxJS log subjects to emit events on endpoint resolver triggers.",
            "Embedded SSE query token authorization layers."
          ]
        },
        {
          date: "Milestone 4",
          title: "OpenAPI Spec Importer",
          status: "Completed",
          icon: <Layers size={14} />,
          desc: "Created YAML/JSON specification parsing utils to read route configurations, query parameters, schemas, and return example templates dynamically.",
          details: [
            "Implemented drag-and-drop file readers supporting OpenAPI v3/Swagger v2 schemas.",
            "Designed selective route checkbox checklists to provision paths in batches."
          ]
        },
        {
          date: "Milestone 5",
          title: "Monaco Code Editor & cURL",
          status: "Completed",
          icon: <Sliders size={14} />,
          desc: "Replaced plain body textareas with Monaco syntax highlighting, client-side JSON format validations, and route cURL command string generators.",
          details: [
            "Embedded Monaco React package configured with theme settings.",
            "Created cURL string builders incorporating headers and representative payloads."
          ]
        },
        {
          date: "Task Updates",
          title: "CORS, Variables & Replay",
          status: "Completed",
          icon: <Cpu size={14} />,
          desc: "Expanded platform capabilities: Custom CORS preflight pre-handling, global project settings variables interpolation, bulk route deletions, and interactive sandbox logs replay.",
          details: [
            "Custom CORS preflight pre-handling resolves preflight OPTIONS queries with 204.",
            "Zustand variable editor bind environment fields to mock response builders.",
            "Sandbox logs replayer modifies captured calls and dispatches testing requests in real-time."
          ]
        }
      ]
    }
  },
  {
    id: "faq",
    label: "FAQ",
    icon: Terminal,
    content: {
      heading: "Frequently asked questions",
      body: null,
      faqs: [
        {
          q: "How does path parameter parsing work?",
          a: "MockForge parses express-style /users/:id or openapi-style /users/{id} parameters. You can reference them inside your response JSON using {{request.params.id}}.",
        },
        {
          q: "Can I import existing Postman collections?",
          a: "MockForge supports OpenAPI v3 and Swagger v2 specifications. You can export your Postman collections as OpenAPI/Swagger spec files and drag-and-drop them directly.",
        },
        {
          q: "Does MockForge support private mock endpoints?",
          a: "Yes. You can toggle a project between public and private. In private mode, clients must pass a valid project API key inside the X-API-Key header to authorize the mock resolver request.",
        },
        {
          q: "What comparison operators are supported for conditional logic?",
          a: "You can match rules on headers, query parameters, or body fields using EQUALS, CONTAINS, EXISTS, NOT_EQUALS, or REGEX pattern matching.",
        },
        {
          q: "Can I export my configuration?",
          a: "Yes, you can export your entire project configuration as a JSON file, or export it as a standard OpenAPI v3 specification file.",
        },
      ],
    },
  },
];

export default function DocsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeSection, setActiveSection] = useState("getting-started");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activeIndex = DOC_SECTIONS.findIndex((s) => s.id === activeSection);
  const active = DOC_SECTIONS[activeIndex] ?? DOC_SECTIONS[0];

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const goTo = (index: number) => {
    const wrapped = (index + DOC_SECTIONS.length) % DOC_SECTIONS.length;
    setActiveSection(DOC_SECTIONS[wrapped].id);
  };
  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  /* ── Swipe handling (mobile) ─────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Ignore mostly-vertical scrolls
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  /* Scroll active section into view on mobile when navigating */
  useEffect(() => {
    const el = document.getElementById(`doc-${activeSection}`);
    if (el && window.innerWidth < 768) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection]);

  /* Lock body scroll while the fullscreen jump menu is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const fontStack =
    "'Inter Variable', ui-sans-serif, system-ui, -apple-system, sans-serif";

  return (
    <main
      className="transition-colors duration-300 min-h-screen flex flex-col relative"
      style={{
        background: isDark ? "#08090a" : "#ffffff",
        color: isDark ? "#f7f8f8" : "#08090a",
      }}
    >
      <Navbar />

      {/* Background theme */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen w-full h-full overflow-hidden">
        <TunnelTheme />
      </div>

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.18em] mb-3"
              style={{
                color: isDark ? "#62666d" : "#8a8f98",
                fontFamily: fontStack,
              }}
            >
              Documentation
            </p>

            <h1
              className="text-[36px] md:text-[48px] leading-[1.1] font-light tracking-[-0.03em] max-w-3xl uppercase font-sans font-semibold"
              style={{
                color: isDark ? "#f7f8f8" : "#08090a",
                fontFamily: fontStack,
              }}
            >
              Everything you need to
              <br />
              get started with MockForge.
            </h1>

            <p
              className="mt-4 max-w-xl text-[15px] leading-relaxed font-light"
              style={{
                color: isDark ? "#8a8f98" : "#62666d",
                fontFamily: fontStack,
              }}
            >
              Setup guidelines, templating helpers, real-time log inspector specs, and API request replay documentation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24 z-10 flex-1 w-full relative">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 relative">
          {/* ── Sidebar (Desktop) ────────────────────── */}
          <aside
            className="hidden md:block w-56 shrink-0 sticky top-28 self-start relative z-10"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
          >
            <nav className="flex flex-col gap-1">
              {DOC_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md transition-all duration-150 text-[13px]"
                    style={{
                      background: isActive
                        ? isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)"
                        : "transparent",
                      color: isActive
                        ? isDark
                          ? "#f7f8f8"
                          : "#08090a"
                        : isDark
                          ? "#8a8f98"
                          : "#62666d",
                      fontFamily: fontStack,
                      fontWeight: isActive ? 510 : 400,
                    }}
                  >
                    <Icon size={14} style={{ opacity: isActive ? 1 : 0.5 }} />
                    {section.label}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar bottom: dashboard CTA */}
            <div
              className="mt-8 pt-6"
              style={{
                borderTop: `1px solid ${isDark ? "#23252a" : "#e5e5e6"}`,
              }}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[13px] no-underline transition-colors duration-150 font-semibold"
                style={{
                  color: isDark ? "#d0d6e0" : "#323334",
                  fontFamily: fontStack,
                }}
              >
                <Sliders size={14} />
                Open Dashboard
                <ExternalLink size={10} style={{ opacity: 0.5 }} />
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
          <div
            className="flex-1 min-w-0 mt-0 md:mt-0 pb-28 md:pb-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              {DOC_SECTIONS.filter((s) => s.id === activeSection).map((section) => {
                const c = section.content;
                return (
                  <motion.div
                    key={section.id}
                    id={`doc-${section.id}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Section heading */}
                    <div
                      style={{
                        color: isDark ? "#f7f8f8" : "#08090a",
                        fontFamily: fontStack,
                      }}
                    >
                      <ScrollReveal
                        key={c.heading}
                        containerClassName="!my-0 mb-6 text-[32px] md:text-[40px] font-light"
                      >
                        {c.heading}
                      </ScrollReveal>
                    </div>

                    {c.body && (
                      <p
                        className="text-[16px] leading-relaxed mb-12 max-w-2xl font-light text-neutral-400"
                        style={{
                          fontFamily: fontStack,
                        }}
                      >
                        {c.body}
                      </p>
                    )}

                    {/* Subsections */}
                    {c.subsections?.map((sub, i) => (
                      <motion.div
                        key={i}
                        className="mb-10 last:mb-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3
                          className="text-[20px] font-normal tracking-[-0.01em] mb-2 text-white font-sans"
                          style={{
                            fontFamily: fontStack,
                          }}
                        >
                          {sub.title}
                        </h3>

                        {sub.text && (
                          <p
                            className="text-[15px] leading-relaxed max-w-2xl font-light text-neutral-400"
                            style={{
                              fontFamily: fontStack,
                            }}
                          >
                            {sub.text}
                          </p>
                        )}

                        {sub.items && (
                          <ul
                            className="mt-2 space-y-1.5 max-w-xl"
                            style={{ color: isDark ? "#d0d6e0" : "#323334" }}
                          >
                            {sub.items.map((item: string, j: number) => (
                              <li
                                key={j}
                                className="text-[15px] leading-relaxed pl-5 relative font-light text-neutral-400"
                                style={{ fontFamily: fontStack }}
                              >
                                <span
                                  className="absolute left-0 top-[0.6em] w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: isDark ? "#62666d" : "#8a8f98",
                                  }}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    ))}

                    {/* Timeline */}
                    {c.timeline && (
                      <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 pl-8 space-y-12 py-2">
                        {c.timeline.map((phase, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[48px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-[#0c0d0e] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 z-10 shadow-sm">
                              {phase.icon}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-[12px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                                {phase.date}
                              </span>
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                                  phase.status === "Completed"
                                    ? "bg-green-50/50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-900/60"
                                    : "bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-900/60"
                                }`}
                              >
                                {phase.status}
                              </span>
                            </div>

                            <h3 className="text-xl font-medium tracking-tight mb-2 text-neutral-900 dark:text-neutral-100">
                              {phase.title}
                            </h3>

                            <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl">
                              {phase.desc}
                            </p>

                            {phase.details && phase.details.length > 0 && (
                              <ul className="mt-3 space-y-1.5 pl-4 list-disc text-[14px] text-neutral-500 dark:text-neutral-400 max-w-2xl">
                                {phase.details.map((detail, dIdx) => (
                                  <li key={dIdx}>{detail}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FAQs */}
                    {c.faqs && (
                      <div className="space-y-8">
                        {c.faqs.map((faq, i) => (
                          <div key={i}>
                            <h3
                              className="text-[17px] font-[510] mb-2"
                              style={{
                                color: isDark ? "#f7f8f8" : "#08090a",
                                fontFamily: fontStack,
                              }}
                            >
                              {faq.q}
                            </h3>
                            <p
                              className="text-[15px] leading-relaxed max-w-2xl text-neutral-400 font-light"
                              style={{
                                fontFamily: fontStack,
                              }}
                            >
                              {faq.a}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code Sample */}
                    {c.codeSample && (
                      <div className="mt-6 space-y-2">
                        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
                          {c.codeSample.title}
                        </span>
                        <div className="relative group">
                          <pre className="font-mono text-xs bg-[#050507] text-neutral-300 p-4 rounded-xl border border-white/[0.05] overflow-x-auto leading-relaxed">
                            {c.codeSample.code}
                          </pre>
                          <button
                            onClick={() => handleCopyCode(c.codeSample!.code, section.id)}
                            className="absolute right-3 top-3 p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/[0.05]"
                            title="Copy code"
                          >
                            {copiedId === section.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       *  MOBILE STICKY BOTTOM COMMAND BAR
       * ═══════════════════════════════════════════════════════════════ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(8,9,10,0) 0%, #08090a 40%)"
            : "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 40%)",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-2xl px-2 py-2 backdrop-blur-xl border shadow-lg"
          style={{
            background: isDark
              ? "rgba(20,21,23,0.85)"
              : "rgba(255,255,255,0.9)",
            borderColor: isDark ? "#23252a" : "#e5e5e6",
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous section"
            className="flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            style={{
              width: 44,
              height: 44,
              color: isDark ? "#d0d6e0" : "#323334",
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl active:scale-[0.98] transition-transform"
            style={{
              height: 44,
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              fontFamily: fontStack,
            }}
          >
            <active.icon
              size={15}
              style={{ color: isDark ? "#f7f8f8" : "#08090a" }}
            />
            <span
              className="text-[13.5px] font-medium truncate max-w-[140px]"
              style={{ color: isDark ? "#f7f8f8" : "#08090a" }}
            >
              {active.label}
            </span>
            <span
              className="text-[11px] tabular-nums"
              style={{ color: isDark ? "#62666d" : "#8a8f98" }}
            >
              {activeIndex + 1}/{DOC_SECTIONS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next section"
            className="flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            style={{
              width: 44,
              height: 44,
              color: isDark ? "#d0d6e0" : "#323334",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       *  MOBILE FULLSCREEN JUMP MENU
       * ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Bottom Sheet */}
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] border-t shadow-2xl overflow-hidden h-[500px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                background: isDark ? "#08090a" : "#ffffff",
                borderColor: isDark ? "#23252a" : "#e5e5e6",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 pt-5 pb-4 border-b"
                style={{ borderColor: isDark ? "#23252a" : "#e5e5e6" }}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid
                    size={16}
                    style={{ color: isDark ? "#8a8f98" : "#62666d" }}
                  />
                  <span
                    className="text-[15px] font-medium"
                    style={{
                      color: isDark ? "#f7f8f8" : "#08090a",
                      fontFamily: fontStack,
                    }}
                  >
                    Jump to section
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
                  style={{
                    width: 44,
                    height: 44,
                    color: isDark ? "#d0d6e0" : "#323334",
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Section list */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                {DOC_SECTIONS.map((section, i) => {
                  const Icon = section.icon;
                  const isActive = section.id === activeSection;
                  return (
                    <motion.button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="w-full flex items-center gap-3.5 px-3.5 rounded-xl mb-1.5 text-left active:scale-[0.98] transition-transform"
                      style={{
                        minHeight: 56,
                        background: isActive
                          ? isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.05)"
                          : "transparent",
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-lg shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          background: isActive
                            ? isDark
                              ? "#ffffff"
                              : "#08090a"
                            : isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)",
                          color: isActive
                            ? isDark
                              ? "#08090a"
                              : "#ffffff"
                            : isDark
                              ? "#8a8f98"
                              : "#62666d",
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span
                        className="text-[15px]"
                        style={{
                          color: isDark ? "#f7f8f8" : "#08090a",
                          fontFamily: fontStack,
                          fontWeight: isActive ? 560 : 420,
                        }}
                      >
                        {section.label}
                      </span>
                      {isActive && (
                        <span
                          className="ml-auto w-2 h-2 rounded-full shrink-0"
                          style={{ background: isDark ? "#f7f8f8" : "#08090a" }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Dashboard in menu footer */}
              <div
                className="px-5 py-4 border-t pb-[max(env(safe-area-inset-bottom),16px)]"
                style={{ borderColor: isDark ? "#23252a" : "#e5e5e6" }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl text-[14px] font-medium no-underline"
                  style={{
                    height: 48,
                    background: isDark ? "#ffffff" : "#08090a",
                    color: isDark ? "#08090a" : "#ffffff",
                    fontFamily: fontStack,
                  }}
                >
                  <Sliders size={15} />
                  Open Dashboard
                  <ExternalLink size={11} style={{ opacity: 0.6 }} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
