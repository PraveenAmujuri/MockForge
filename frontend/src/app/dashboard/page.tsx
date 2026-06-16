"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { FolderKanban, FileCode2, Terminal, ArrowRight, Plus, Activity, Loader2 } from "lucide-react";

export default function Overview() {
  const { projects, fetchProjects, isLoadingProjects } = useStore();
  const [totalEndpoints, setTotalEndpoints] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [requestsToday, setRequestsToday] = useState(0);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let count = 0;
    projects.forEach((p) => {
      if (p._count) {
        count += p._count.endpoints;
      }
    });
    setTotalEndpoints(count);
  }, [projects]);

  useEffect(() => {
    if (projects.length > 0) {
      setIsLoadingActivity(true);
      const fetchAllLogs = async () => {
        try {
          const allProjectLogs: any[] = [];
          for (const project of projects) {
            await useStore.getState().fetchLogs(project.id);
            const projectLogs = useStore.getState().logs;
            // Inject project name to logs
            const mappedLogs = projectLogs.map(l => ({ ...l, projectName: project.name, projectSlug: project.slug }));
            allProjectLogs.push(...mappedLogs);
          }
          
          allProjectLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startOfToday = today.getTime();
          const todayLogs = allProjectLogs.filter(log => new Date(log.createdAt).getTime() >= startOfToday);
          
          setRecentLogs(allProjectLogs.slice(0, 5));
          setRequestsToday(todayLogs.length);
        } catch (err) {
          console.error("Failed to load activity logs:", err);
        } finally {
          setIsLoadingActivity(false);
        }
      };
      fetchAllLogs();
    }
  }, [projects]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Get a high-level view of your mock services activity</p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Link>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Projects */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </div>
          {isLoadingProjects ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-3xl font-bold">{projects.length}</div>
          )}
        </div>

        {/* Total Endpoints */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mock Endpoints</span>
            <FileCode2 className="w-4 h-4 text-muted-foreground" />
          </div>
          {isLoadingProjects ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-3xl font-bold">{totalEndpoints}</div>
          )}
        </div>

        {/* Requests Today */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requests Today</span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          {isLoadingActivity ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-3xl font-bold">{requestsToday}</div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Activity Logs</h3>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="divide-y divide-border/50">
            {isLoadingActivity ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No requests logged yet. Trigger some requests to see logs here.
              </div>
            ) : (
              recentLogs.map((log) => (
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
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs text-foreground truncate max-w-xs md:max-w-md">
                        {log.endpoint?.path || "/"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Project: <span className="font-medium">{log.projectName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 flex-shrink-0">
                    <div className="text-xs font-medium text-foreground">
                      {log.ipAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links / Projects Widget */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-semibold text-sm border-b border-border/40 pb-2">Your Projects</h3>
          {isLoadingProjects ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No projects created yet.</div>
          ) : (
            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.slug}/endpoints`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-secondary/40 transition-colors group text-sm"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p._count?.endpoints || 0} mock endpoints
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
              {projects.length > 4 && (
                <Link
                  href="/dashboard/projects"
                  className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:underline pt-2"
                >
                  View all {projects.length} projects
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
