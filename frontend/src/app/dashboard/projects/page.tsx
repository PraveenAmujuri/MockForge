"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import {
  Search,
  Plus,
  Copy,
  Check,
  Globe,
  Lock,
  Calendar,
  Layers,
  Loader2,
  ExternalLink,
  X,
  FolderKanban,
  UploadCloud
} from "lucide-react";

export default function Projects() {
  const { projects, fetchProjects, isLoadingProjects, createProject, importProject } = useStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCopy = (e: React.MouseEvent, apiKey: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(apiKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const projectData = JSON.parse(content);
        
        if (!projectData.name) {
          throw new Error("Invalid project file. Name is required.");
        }

        const project = await importProject(projectData);
        if (project) {
          fetchProjects();
        } else {
          setImportError("Failed to import project. Slug might be already in use.");
        }
      } catch (err: any) {
        setImportError(err.message || "Failed to parse project file. Ensure it is valid JSON.");
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!projectName.trim()) {
      setError("Project name cannot be empty");
      setIsSubmitting(false);
      return;
    }

    const project = await createProject(projectName, isPublic);
    setIsSubmitting(false);

    if (project) {
      setIsModalOpen(false);
      setProjectName("");
      setIsPublic(false);
    } else {
      setError("Failed to create project. The slug might already be in use.");
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage mock environments and API configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          >
            {importing ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-500" />
            ) : (
              <UploadCloud className="w-4.5 h-4.5 text-indigo-500" />
            )}
            Import Project
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {importError && (
        <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex justify-between items-center animate-in fade-in">
          <span>{importError}</span>
          <button onClick={() => setImportError(null)} className="text-rose-500 hover:text-rose-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      {projects.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/80 bg-card text-sm input-premium"
          />
        </div>
      )}

      {/* Grid of Projects */}
      {isLoadingProjects && projects.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center max-w-xl mx-auto mt-6">
          <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold">
            {searchTerm ? "No projects found" : "Create your first project"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            {searchTerm
              ? `We couldn't find any projects matching "${searchTerm}". Try resetting your query.`
              : "Projects group mock REST API endpoints together under a custom sub-path. Start by creating a project."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.slug}/endpoints`}
              className="rounded-xl border border-border bg-card p-5 hover:border-foreground/40 transition-colors shadow-sm block group space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {project.name}
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-all" />
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">/mock/{project.slug}</p>
                </div>
                <div className="flex items-center">
                  {project.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/15">
                      <Globe className="w-3 h-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium border border-amber-500/15">
                      <Lock className="w-3 h-3" />
                      Private
                    </span>
                  )}
                </div>
              </div>

              {/* Stats & Key Row */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-border/50 py-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Endpoints</span>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    {project._count?.endpoints || 0} created
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Created At</span>
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(project.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>

              {/* API Key Display */}
              {!project.isPublic && (
                <div className="flex items-center justify-between gap-2 bg-secondary/40 px-2.5 py-1.5 rounded-lg border border-border/60 text-xs">
                  <span className="font-mono text-muted-foreground truncate select-none">
                    {copiedId === project.id ? project.apiKey : "••••••••••••••••••••"}
                  </span>
                  <button
                    onClick={(e) => handleCopy(e, project.apiKey, project.id)}
                    className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex-shrink-0"
                    title="Copy API Key"
                  >
                    {copiedId === project.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 animate-in fade-in" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          {/* Dialog Container */}
          <div className="relative w-full max-w-md bg-card rounded-xl border border-border p-6 shadow-xl z-50 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Create new project</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Scaffold a new mock environment</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {error && (
                <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My E-commerce API"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-sm input-premium"
                  required
                />
              </div>

              {/* Toggle Public/Private */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/20">
                <div className="space-y-0.5 max-w-[280px]">
                  <span className="text-sm font-medium block">Public Accessibility</span>
                  <span className="text-xs text-muted-foreground block">
                    Public projects are accessible directly by URL without requiring an API key.
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border bg-card hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-lg text-sm font-medium transition-opacity flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
