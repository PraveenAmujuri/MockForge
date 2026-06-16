"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { FileCode2, Terminal, ArrowRight, Plus, Activity, Loader2 } from "lucide-react";

export default function ProjectOverview() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  const {
    projects,
    currentProject,
    fetchProjects,
    endpoints,
    fetchEndpoints,
    logs,
    fetchLogs,
    isLoadingProjects
  } = useStore();

  const [requestsToday, setRequestsToday] = useState(0);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects, fetchProjects]);

  useEffect(() => {
    if (currentProject) {
      fetchEndpoints(currentProject.id);
      fetchLogs(currentProject.id);
    }
  }, [currentProject, fetchEndpoints, fetchLogs]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    const todayLogs = logs.filter(log => new Date(log.createdAt).getTime() >= startOfToday);
    setRequestsToday(todayLogs.length);
  }, [logs]);

  if (!currentProject) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{currentProject.name} Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your specific mock endpoints and integration metrics</p>
        </div>
        <Link
          href={`/dashboard/projects/${projectSlug}/endpoints`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Endpoint
        </Link>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Endpoints */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mock Endpoints</span>
            <FileCode2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{endpoints.length}</div>
        </div>

        {/* Requests Today */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requests Today</span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{requestsToday}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Project Logs */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Request Logs</h3>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="divide-y divide-border/50">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No requests logged for this project. Query your endpoints to populate this list.
              </div>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-4 hover:bg-secondary/20 transition-colors flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
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
                    <div className="font-mono text-xs text-foreground truncate max-w-xs md:max-w-md">
                      {log.endpoint?.path || "/"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs">
                    <div className="font-medium text-foreground">{log.ipAddress}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {logs.length > 5 && (
            <div className="px-5 py-3 border-t border-border/50 bg-secondary/10 text-center">
              <Link
                href={`/dashboard/projects/${projectSlug}/logs`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View all logs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Project Endpoints Quick Widget */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-semibold text-sm border-b border-border/40 pb-2">Active Endpoints</h3>
          {endpoints.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No endpoints created yet.</div>
          ) : (
            <div className="space-y-2.5">
              {endpoints.slice(0, 4).map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-secondary/20 text-sm font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-semibold text-[9px] px-1.5 py-0.5 rounded ${
                        ep.method === "GET"
                          ? "bg-sky-500/10 text-sky-500 border border-sky-500/15"
                          : ep.method === "POST"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                          : ep.method === "PUT" || ep.method === "PATCH"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="truncate text-xs">{ep.path}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{ep.statusCode}</span>
                </div>
              ))}
              {endpoints.length > 4 && (
                <Link
                  href={`/dashboard/projects/${projectSlug}/endpoints`}
                  className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:underline pt-2"
                >
                  View all {endpoints.length} endpoints
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
