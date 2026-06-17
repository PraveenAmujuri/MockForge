"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore, RequestLog } from "@/store/useStore";
import {
  Terminal,
  Trash2,
  Loader2,
  X,
  Search,
  Check,
  Copy,
  Info
} from "lucide-react";

export default function RequestLogs() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  const {
    projects,
    currentProject,
    fetchProjects,
    logs,
    fetchLogs,
    clearLogs,
    addLog,
    isLoadingLogs
  } = useStore();

  const [activeLog, setActiveLog] = useState<RequestLog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [recentLogIds, setRecentLogIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects, fetchProjects]);

  useEffect(() => {
      if (!currentProject) return;

      // 1. Clear out stale views and populate historical log states
      fetchLogs(currentProject.id);

      // 2. Extract configuration variables safely
      const token = localStorage.getItem("mockforge_token") || "";
      const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      
      // Clean base domain logic: Strip trailing slashes or sub-paths, then map exactly to backend entry point
      const baseHost = envUrl.replace(/\/api$/, "").replace(/\/$/, "");
      
      // Explicitly target your NestJS controller endpoint mapping topology
      const sseUrl = `${baseHost}/api/logs/sse/${currentProject.id}?token=${token}`;

      console.log("⚡ Establishing real-time event pipeline stream link to:", sseUrl);
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const newLog = JSON.parse(event.data);
          addLog(newLog);

          // Flash and pulse incoming network calls instantly inside our brutalist rows
          setRecentLogIds((prev) => ({ ...prev, [newLog.id]: true }));
          setTimeout(() => {
            setRecentLogIds((prev) => {
              const copy = { ...prev };
              delete copy[newLog.id];
              return copy;
            });
          }, 4000);
        } catch (err) {
          console.error("Failed to parse real-time log event data chunk:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("🔴 Server-Sent Events handshake blocked or closed down:", err);
      };

      return () => {
        console.log("🔌 Severing active event stream socket context layer...");
        eventSource.close();
      };
    }, [currentProject, fetchLogs, addLog]);

  const handleClearLogs = async () => {
    if (!currentProject) return;
    if (confirm("Are you sure you want to clear all request logs for this project?")) {
      await clearLogs(currentProject.id);
      setActiveLog(null);
    }
  };

  const handleCopy = (text: string, type: "headers" | "body") => {
    navigator.clipboard.writeText(text);
    if (type === "headers") {
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 1500);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 1500);
    }
  };

  // Filter logs by path search
  const filteredLogs = logs.filter((l) =>
    (l.endpoint?.path || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor mock API invocations and headers in real-time</p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 text-sm font-medium hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        )}
      </div>

      {/* Search Bar */}
      {logs.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/80 bg-card text-sm input-premium"
          />
        </div>
      )}

      {/* Logs View */}
      {isLoadingLogs && logs.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center max-w-xl mx-auto mt-6">
          <Terminal className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold">
            {searchTerm ? "No matching request logs" : "No requests captured yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            {searchTerm
              ? `No requests match path filter "${searchTerm}". Reset your query.`
              : "When clients query your mock endpoints, the details (headers, payload, caller IP) will appear here instantly."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Route Path</th>
                  <th className="px-5 py-3">Client IP</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className={`hover:bg-secondary/15 transition-all duration-500 cursor-pointer border-l-2 ${
                      recentLogIds[log.id]
                        ? "bg-indigo-500/10 border-l-indigo-500 shadow-[inset_0_0_12px_rgba(99,102,241,0.2)] animate-pulse"
                        : "border-l-transparent"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {recentLogIds[log.id] && (
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                        )}
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            log.method === "GET"
                              ? "bg-sky-500/10 text-sky-500"
                              : log.method === "POST"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : log.method === "PUT" || log.method === "PATCH"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {log.method}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-foreground truncate max-w-xs md:max-w-md">
                      {log.endpoint?.path || "/"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                      {log.ipAddress}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOG DETAILS DRAWER */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setActiveLog(null)}
          />
          {/* Drawer Container */}
          <div className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight">Request Details</h3>
                <p className="text-xs text-muted-foreground">Captured at {new Date(activeLog.createdAt).toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Request Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-4 rounded-xl border border-border/40">
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">Method</span>
                  <div className="font-semibold">{activeLog.method}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">IP Address</span>
                  <div className="font-mono text-xs">{activeLog.ipAddress}</div>
                </div>
                <div className="col-span-2 space-y-0.5">
                  <span className="text-xs text-muted-foreground">Path</span>
                  <div className="font-mono text-xs text-foreground bg-background/60 px-2 py-1.5 rounded border border-border/40 truncate">
                    {activeLog.endpoint?.path || "/"}
                  </div>
                </div>
              </div>

              {/* Request Headers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Headers</h4>
                  <button
                    onClick={() => handleCopy(JSON.stringify(activeLog.headers, null, 2), "headers")}
                    className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Copy Headers"
                  >
                    {copiedHeaders ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <pre className="font-mono text-[10px] bg-[#0a0a0c] text-neutral-300 p-3.5 rounded-xl border border-border/40 overflow-x-auto max-h-48 leading-normal">
                  {JSON.stringify(activeLog.headers, null, 2)}
                </pre>
              </div>

              {/* Request Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Body Payload</h4>
                  {activeLog.body && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(activeLog.body, null, 2), "body")}
                      className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      title="Copy Body"
                    >
                      {copiedBody ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <pre className="font-mono text-[10px] bg-[#0a0a0c] text-neutral-300 p-3.5 rounded-xl border border-border/40 overflow-x-auto max-h-48 leading-normal">
                  {activeLog.body ? JSON.stringify(activeLog.body, null, 2) : "No body payload sent"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
