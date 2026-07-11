"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Settings,
  Lock,
  Globe,
  RefreshCw,
  Trash2,
  Check,
  Copy,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function ProjectSettings() {
  const params = useParams();
  const router = useRouter();
  const projectSlug = params.projectSlug as string;

  const {
    projects,
    currentProject,
    fetchProjects,
    updateProject,
    deleteProject,
    regenerateApiKey,
    exportProject
  } = useStore();

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  
  // CORS States
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [corsOrigin, setCorsOrigin] = useState("*");
  const [corsMethods, setCorsMethods] = useState("GET,POST,PUT,PATCH,DELETE,OPTIONS");
  const [corsHeaders, setCorsHeaders] = useState("*");
  const [corsCredentials, setCorsCredentials] = useState(false);

  // Variables States
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([]);

  // Renaming state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Deletion state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects, fetchProjects]);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setIsPublic(currentProject.isPublic);
      
      const vars = currentProject.variables;
      setVariables(Array.isArray(vars) ? vars : []);

      const cors = currentProject.corsConfig || {};
      setCorsEnabled(cors.enabled !== false);
      setCorsOrigin(cors.origin || "*");
      setCorsMethods(cors.methods || "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      setCorsHeaders(cors.headers || "*");
      setCorsCredentials(!!cors.credentials);
    }
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleExportProject = async () => {
    const data = await exportProject(currentProject.id);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject.slug}-mockforge.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsUpdating(true);

    if (!name.trim()) {
      setUpdateError("Project name cannot be empty");
      setIsUpdating(false);
      return;
    }

    try {
      const oldSlug = currentProject.slug;
      
      const cleanVars = variables.filter(v => v.key.trim() !== "");
      const corsConfig = {
        enabled: corsEnabled,
        origin: corsOrigin,
        methods: corsMethods,
        headers: corsHeaders,
        credentials: corsCredentials
      };

      await updateProject(currentProject.id, name, isPublic, cleanVars, corsConfig);
      
      const updatedProject = useStore.getState().projects.find(p => p.id === currentProject.id);
      
      setUpdateSuccess(true);
      
      if (updatedProject && updatedProject.slug !== oldSlug) {
        router.push(`/dashboard/projects/${updatedProject.slug}/settings`);
      }
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || "Failed to update project settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (confirm("Are you sure you want to regenerate the API key? Existing clients using the old key will get a 401 Unauthorized error immediately.")) {
      setIsRegenerating(true);
      await regenerateApiKey(currentProject.id);
      setIsRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentProject.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeleting(true);

    if (deleteConfirmText !== currentProject.name) {
      setDeleteError("Verification text does not match the project name");
      setIsDeleting(false);
      return;
    }

    try {
      await deleteProject(currentProject.id);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete project");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-2xl">
      {/* Title */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure project metadata, security, and lifecycle</p>
      </div>

      {/* Consolidated Settings Form */}
      <form onSubmit={handleUpdate} className="space-y-8">
        {updateError && (
          <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
            {updateError}
          </div>
        )}
        {updateSuccess && (
          <div className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            Project settings saved successfully.
          </div>
        )}

        {/* General Information Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-base border-b border-border/40 pb-2 flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-muted-foreground" />
            General Information
          </h3>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdating}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Project Slug
              </label>
              <input
                type="text"
                value={currentProject.slug}
                disabled
                className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-sm font-mono text-muted-foreground cursor-not-allowed"
              />
              <span className="text-xs text-muted-foreground block">
                Used in mock URLs. Re-evaluates automatically if you rename the project.
              </span>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/80 bg-secondary/10">
              <div className="space-y-0.5 max-w-[420px]">
                <span className="text-sm font-medium block">Public Accessibility</span>
                <span className="text-xs text-muted-foreground block">
                  Allow queries directly by path without API Key verification header checks.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-foreground after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-foreground peer-checked:after:bg-background"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Environment Variables Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-base border-b border-border/40 pb-2 flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-indigo-400" />
            Environment & Project Variables
          </h3>
          <p className="text-xs text-muted-foreground">
            Define global variables that can be dynamically parsed in mock paths or responses as <code className="font-mono bg-secondary/40 px-1 rounded">{"{{project.VARIABLE_NAME}}"}</code>.
          </p>

          <div className="space-y-3">
            {variables.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                  <div className="col-span-5">Variable Key</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {variables.map((variable, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={variable.key}
                          onChange={(e) => {
                            const newVars = [...variables];
                            newVars[idx].key = e.target.value.replace(/[^a-zA-Z0-9_]/g, ""); // only alphanumeric and underscore
                            setVariables(newVars);
                          }}
                          placeholder="e.g. API_URL"
                          className="w-full h-8 rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground input-premium font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) => {
                            const newVars = [...variables];
                            newVars[idx].value = e.target.value;
                            setVariables(newVars);
                          }}
                          placeholder="Variable value"
                          className="w-full h-8 rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground input-premium"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setVariables(variables.filter((_, i) => i !== idx));
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete variable"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setVariables([...variables, { key: "", value: "" }])}
              className="w-full py-1.5 border border-dashed border-border hover:border-border/100 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5 bg-secondary/10"
            >
              Add Variable
            </button>
          </div>
        </div>

        {/* CORS Configuration Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-indigo-400" />
              Custom CORS Settings
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={corsEnabled}
                onChange={(e) => setCorsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-foreground after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-foreground peer-checked:after:bg-background"></div>
            </label>
          </div>

          {corsEnabled && (
            <div className="space-y-4 animate-in slide-in-from-top-1 duration-150 text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Access-Control-Allow-Origin
                </label>
                <input
                  type="text"
                  value={corsOrigin}
                  onChange={(e) => setCorsOrigin(e.target.value)}
                  placeholder="*"
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs input-premium"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Access-Control-Allow-Methods
                </label>
                <input
                  type="text"
                  value={corsMethods}
                  onChange={(e) => setCorsMethods(e.target.value)}
                  placeholder="GET,POST,PUT,PATCH,DELETE,OPTIONS"
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs input-premium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Access-Control-Allow-Headers
                </label>
                <input
                  type="text"
                  value={corsHeaders}
                  onChange={(e) => setCorsHeaders(e.target.value)}
                  placeholder="*"
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs input-premium"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium block">Allow Credentials</span>
                  <span className="text-[10px] text-muted-foreground block">
                    Expose CORS credentials validation checks on clients.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={corsCredentials}
                  onChange={(e) => setCorsCredentials(e.target.checked)}
                  className="rounded border-border text-foreground focus:ring-0 bg-background"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save button for settings form */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-lg text-sm font-medium transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Project Settings
          </button>
        </div>
      </form>

      {/* Export Settings Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base border-b border-border/40 pb-2 flex items-center gap-2">
          <RefreshCw className="w-4.5 h-4.5 text-muted-foreground" />
          Export Project Specification
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Export this project configuration—including variables, metadata, mock paths, and conditional evaluation rules—to share it or back it up.
        </p>
        <button
          type="button"
          onClick={handleExportProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-secondary transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Export Project JSON
        </button>
      </div>

      {/* Security settings */}
      {!isPublic && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-base border-b border-border/40 pb-2 flex items-center gap-2">
            <Lock className="w-4.5 h-4.5 text-muted-foreground" />
            Security & Authentication
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                API Secret Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentProject.apiKey}
                  disabled
                  className="flex-1 h-9 rounded-lg border border-border bg-secondary/35 px-3 py-1.5 text-xs font-mono text-foreground"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3 border border-border bg-card hover:bg-secondary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  title="Copy Key"
                >
                  {copiedKey ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-xs text-muted-foreground block">
                Attach this key as the `X-API-Key` header on all mock HTTP calls.
              </span>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="px-3 py-1.5 border border-border bg-card hover:bg-secondary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                Regenerate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 shadow-sm space-y-5">
        <h3 className="font-semibold text-base text-rose-500 border-b border-rose-500/10 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          Danger Zone
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deleting this project will permanently erase all configurations, endpoints, and requests logs associated with it. This process cannot be undone.
          </p>

          <form onSubmit={handleDelete} className="space-y-3">
            {deleteError && (
              <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground">
                To confirm, type <span className="font-bold text-foreground select-all">{currentProject.name}</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type project name exactly"
                disabled={isDeleting}
                className="w-full max-w-md h-9 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-sm input-premium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isDeleting || deleteConfirmText !== currentProject.name}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
