"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore, MockEndpoint } from "@/store/useStore";
import {
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  CopyPlus,
  Loader2,
  X,
  FileCode,
  Info
} from "lucide-react";

// Standard HTTP Status Code Dictionary for human-readable mapping
const HTTP_STATUS_CODES = [
  { group: "2xx Success", codes: [
    { value: 200, label: "200 - OK" },
    { value: 201, label: "201 - Created" },
    { value: 202, label: "202 - Accepted" },
    { value: 204, label: "204 - No Content" }
  ]},
  { group: "3xx Redirection", codes: [
    { value: 301, label: "301 - Moved Permanently" },
    { value: 302, label: "302 - Found" },
    { value: 304, label: "304 - Not Modified" }
  ]},
  { group: "4xx Client Errors", codes: [
    { value: 400, label: "400 - Bad Request" },
    { value: 401, label: "401 - Unauthorized" },
    { value: 403, label: "403 - Forbidden" },
    { value: 404, label: "404 - Not Found" },
    { value: 409, label: "409 - Conflict" },
    { value: 422, label: "422 - Unprocessable Entity" },
    { value: 429, label: "429 - Too Many Requests" }
  ]},
  { group: "5xx Server Errors", codes: [
    { value: 500, label: "500 - Internal Server Error" },
    { value: 502, label: "502 - Bad Gateway" },
    { value: 503, label: "503 - Service Unavailable" },
    { value: 504, label: "504 - Gateway Timeout" }
  ]}
];

// Preset Network Latency Targets
const LATENCY_PRESETS = [
  { value: 0, label: "0ms (Instant / Local)" },
  { value: 200, label: "200ms (Fast 4G Network)" },
  { value: 500, label: "500ms (Average Network)" },
  { value: 1000, label: "1000ms (1s - Slow Latency)" },
  { value: 2000, label: "2000ms (2s - Heavy Database Lag)" },
  { value: 5000, label: "5000ms (5s - Mobile Timeout Test)" }
];

export default function Endpoints() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  const {
    projects,
    currentProject,
    fetchProjects,
    endpoints,
    fetchEndpoints,
    isLoadingEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    duplicateEndpoint
  } = useStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<MockEndpoint | null>(null);

  const [formName, setFormName] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formMethod, setFormMethod] = useState("GET");
  const [formStatusCode, setFormStatusCode] = useState(200);
  const [formDelayMs, setFormDelayMs] = useState(0);
  const [formResponseJson, setFormResponseJson] = useState("{\n  \"message\": \"Hello World\"\n}");
  const [formRules, setFormRules] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects, fetchProjects]);

  useEffect(() => {
    if (currentProject) {
      fetchEndpoints(currentProject.id);
    }
  }, [currentProject, fetchEndpoints]);

  const handleCopyKey = () => {
    if (currentProject) {
      navigator.clipboard.writeText(currentProject.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  const openCreateModal = () => {
    setFormName("");
    setFormPath("/api/data");
    setFormMethod("GET");
    setFormStatusCode(200);
    setFormDelayMs(0);
    setFormResponseJson("{\n  \"status\": \"success\",\n  \"data\": []\n}");
    setFormRules([]);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (endpoint: MockEndpoint) => {
    setActiveEndpoint(endpoint);
    setFormName(endpoint.name);
    setFormPath(endpoint.path);
    setFormMethod(endpoint.method);
    setFormStatusCode(endpoint.statusCode);
    setFormDelayMs(endpoint.delayMs);
    setFormResponseJson(JSON.stringify(endpoint.responseJson, null, 2));
    setFormRules(
      (endpoint.rules || []).map((r: any) => ({
        ...r,
        responseJsonString: JSON.stringify(r.responseJson, null, 2),
      }))
    );
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (endpoint: MockEndpoint) => {
    setActiveEndpoint(endpoint);
    setIsDeleteModalOpen(true);
  };

  const handleAddRule = () => {
    setFormRules((prev) => [
      ...prev,
      {
        target: "query",
        parameter: "",
        operator: "EQUALS",
        value: "",
        statusCode: 200,
        delayMs: 0,
        responseJson: { message: "Override response" },
        responseJsonString: JSON.stringify({ message: "Override response" }, null, 2),
      },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setFormRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (index: number, key: string, val: any) => {
    setFormRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: val } : r))
    );
  };

  const handleUpdateRuleResponseJson = (index: number, val: string) => {
    setFormRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, responseJsonString: val } : r))
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    setFormError(null);
    setIsSubmitting(true);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(formResponseJson);
    } catch (err) {
      setFormError("Invalid JSON in Response Body. Check your syntax.");
      setIsSubmitting(false);
      return;
    }

    const rulesToSubmit: any[] = [];
    for (let i = 0; i < formRules.length; i++) {
      const r = formRules[i];
      try {
        const parsedRuleJson = JSON.parse(r.responseJsonString || JSON.stringify(r.responseJson));
        const { responseJsonString, ...rest } = r;
        rulesToSubmit.push({ ...rest, responseJson: parsedRuleJson });
      } catch (err) {
        setFormError(`Invalid JSON in Rule #${i + 1} Override Response Body.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const success = await createEndpoint({
        projectId: currentProject.id,
        name: formName,
        path: formPath,
        method: formMethod,
        responseJson: parsedJson,
        statusCode: Number(formStatusCode),
        delayMs: Number(formDelayMs),
        rules: rulesToSubmit,
      });

      if (success) {
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to create mock endpoint. Path + Method combination might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEndpoint) return;
    setFormError(null);
    setIsSubmitting(true);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(formResponseJson);
    } catch (err) {
      setFormError("Invalid JSON in Response Body. Check your syntax.");
      setIsSubmitting(false);
      return;
    }

    const rulesToSubmit: any[] = [];
    for (let i = 0; i < formRules.length; i++) {
      const r = formRules[i];
      try {
        const parsedRuleJson = JSON.parse(r.responseJsonString || JSON.stringify(r.responseJson));
        const { responseJsonString, ...rest } = r;
        rulesToSubmit.push({ ...rest, responseJson: parsedRuleJson });
      } catch (err) {
        setFormError(`Invalid JSON in Rule #${i + 1} Override Response Body.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await updateEndpoint(activeEndpoint.id, {
        name: formName,
        path: formPath,
        method: formMethod,
        responseJson: parsedJson,
        statusCode: Number(formStatusCode),
        delayMs: Number(formDelayMs),
        rules: rulesToSubmit,
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update endpoint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeEndpoint) return;
    setIsSubmitting(true);
    try {
      await deleteEndpoint(activeEndpoint.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    await duplicateEndpoint(id);
  };

  const baseUrl = `http://localhost:4000/mock/${projectSlug}`;

  const filteredEndpoints = endpoints.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || e.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Endpoints</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure paths, status codes, and mock payloads</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Endpoint
        </button>
      </div>

      {/* API Integration banner */}
      {currentProject && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-500" />
            Integration Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 bg-secondary/30 p-3 rounded-lg border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mock Base URL</span>
              <div className="flex items-center justify-between gap-2 text-sm mt-1">
                <code className="font-mono text-xs select-all text-foreground truncate">{baseUrl}</code>
                <button
                  onClick={() => handleCopyUrl(baseUrl, "base_url")}
                  className="p-1 text-muted-foreground hover:bg-secondary hover:text-foreground rounded transition-colors"
                >
                  {copiedUrl === "base_url" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            {!currentProject.isPublic && (
              <div className="space-y-1 bg-secondary/30 p-3 rounded-lg border border-border/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">X-API-Key Header</span>
                <div className="flex items-center justify-between gap-2 text-sm mt-1">
                  <code className="font-mono text-xs select-all text-foreground truncate">
                    {copiedKey ? currentProject.apiKey : "mf_live_••••••••••••••••••••"}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className="p-1 text-muted-foreground hover:bg-secondary hover:text-foreground rounded transition-colors"
                  >
                    {copiedKey ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters & Actions controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by path or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/80 bg-card text-sm input-premium"
          />
        </div>

        <div className="flex border border-border/80 p-0.5 rounded-lg bg-card text-xs w-full sm:w-auto">
          {["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-all ${
                methodFilter === m
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints Table */}
      {isLoadingEndpoints && endpoints.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEndpoints.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center max-w-xl mx-auto mt-6">
          <FileCode className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold">
            {searchTerm || methodFilter !== "ALL" ? "No endpoints match filters" : "Create mock API endpoints"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            {searchTerm || methodFilter !== "ALL"
              ? "Try resetting your search filters to find existing endpoints."
              : "Instantly build fake REST routes. Define your mock paths, delays, status codes, and JSON payloads."}
          </p>
          {!searchTerm && methodFilter === "ALL" && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Endpoint
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Route Path</th>
                  <th className="px-5 py-3">Status Code</th>
                  <th className="px-5 py-3">Latency</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEndpoints.map((ep) => {
                  const fullMockUrl = `${baseUrl}${ep.path}`;
                  return (
                    <tr key={ep.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="px-5 py-4 font-medium text-foreground">{ep.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              ep.method === "GET"
                                ? "bg-sky-500/10 text-sky-500"
                                : ep.method === "POST"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : ep.method === "PUT" || ep.method === "PATCH"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="truncate max-w-[200px] md:max-w-xs">{ep.path}</span>
                          <button
                            onClick={() => handleCopyUrl(fullMockUrl, ep.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-secondary rounded transition-all"
                            title="Copy full mock URL"
                          >
                            {copiedUrl === ep.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            ep.statusCode >= 200 && ep.statusCode < 300
                              ? "bg-emerald-500/10 text-emerald-500"
                              : ep.statusCode >= 400
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {ep.statusCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                        {ep.delayMs > 0 ? `${ep.delayMs}ms` : "None"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleDuplicate(e, ep.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            title="Duplicate Endpoint"
                          >
                            <CopyPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(ep)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            title="Edit Endpoint"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(ep)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg transition-colors"
                            title="Delete Endpoint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT MODALS */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }} />
          <div className="relative w-full max-w-lg bg-card rounded-xl border border-border p-6 shadow-xl z-50 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-border/40 pb-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  {isCreateModalOpen ? "Add new endpoint" : "Edit endpoint"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">Configure mock path and outputs</p>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Endpoint Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. List Products"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    HTTP Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium text-foreground"
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <option key={m} value={m} className="bg-card">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /api/v1/products"
                    value={formPath}
                    onChange={(e) => setFormPath(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium font-mono text-foreground"
                    required
                  />
                </div>

                {/* MODIFIED: Changed from standard input box to grouped descriptor select picker */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Status Code
                  </label>
                  <select
                    value={formStatusCode}
                    onChange={(e) => setFormStatusCode(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium text-foreground selection:bg-neutral-800"
                    required
                  >
                    {HTTP_STATUS_CODES.map((group) => (
                      <optgroup key={group.group} label={group.group} className="bg-card text-muted-foreground font-semibold">
                        {group.codes.map((code) => (
                          <option key={code.value} value={code.value} className="text-foreground font-normal">
                            {code.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* MODIFIED: Changed from open dynamic integer input fields to drop down profile presets */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Latency (ms Delay)
                  </label>
                  <select
                    value={formDelayMs}
                    onChange={(e) => setFormDelayMs(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm input-premium text-foreground"
                    required
                  >
                    {LATENCY_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value} className="bg-card">
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

                <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Response Body (JSON)
                </label>
                <textarea
                  value={formResponseJson}
                  onChange={(e) => setFormResponseJson(e.target.value)}
                  className="w-full h-36 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono input-premium leading-relaxed text-foreground"
                  placeholder='{"key": "value"}'
                  required
                />
              </div>

              {/* Conditional Rules Section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      Conditional Rules ({formRules.length})
                    </label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Evaluate rules sequentially to return custom responses</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-secondary/40 text-xs font-medium hover:bg-secondary transition-colors text-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Rule
                  </button>
                </div>

                {formRules.length > 0 && (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {formRules.map((rule, index) => (
                      <div key={index} className="border border-border bg-card rounded-lg p-4 space-y-3 relative">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="text-xs font-semibold text-foreground/80">Rule #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(index)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Request Target
                            </label>
                            <select
                              value={rule.target}
                              onChange={(e) => handleUpdateRule(index, "target", e.target.value)}
                              className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium"
                            >
                              <option value="query" className="bg-card">Query Parameter</option>
                              <option value="header" className="bg-card">Request Header</option>
                              <option value="body" className="bg-card">Request Body</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Parameter Name
                            </label>
                            <input
                              type="text"
                              placeholder={rule.target === "header" ? "e.g. X-User-Role" : "e.g. user.id"}
                              value={rule.parameter}
                              onChange={(e) => handleUpdateRule(index, "parameter", e.target.value)}
                              className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Matching Operator
                            </label>
                            <select
                              value={rule.operator}
                              onChange={(e) => handleUpdateRule(index, "operator", e.target.value)}
                              className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium"
                            >
                              <option value="EQUALS" className="bg-card">Equals</option>
                              <option value="CONTAINS" className="bg-card">Contains</option>
                              <option value="EXISTS" className="bg-card">Exists</option>
                              <option value="NOT_EQUALS" className="bg-card">Not Equals</option>
                              <option value="REGEX" className="bg-card">Regex Match</option>
                            </select>
                          </div>

                          {rule.operator !== "EXISTS" ? (
                            <div>
                              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Value to Match
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. premium"
                                value={rule.value}
                                onChange={(e) => handleUpdateRule(index, "value", e.target.value)}
                                className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium"
                                required
                              />
                            </div>
                          ) : (
                            <div className="flex items-end pb-2">
                              <span className="text-[10px] text-muted-foreground italic">Checks presence of parameter</span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Override Status Code
                            </label>
                            <select
                              value={rule.statusCode}
                              onChange={(e) => handleUpdateRule(index, "statusCode", Number(e.target.value))}
                              className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium"
                              required
                            >
                              {HTTP_STATUS_CODES.map((group) =>
                                group.codes.map((c) => (
                                  <option key={c.value} value={c.value} className="bg-card">
                                    {c.label}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Override Latency
                            </label>
                            <select
                              value={rule.delayMs || 0}
                              onChange={(e) => handleUpdateRule(index, "delayMs", Number(e.target.value))}
                              className="w-full h-8 rounded border border-border bg-background px-2 py-1 text-xs text-foreground input-premium"
                              required
                            >
                              {LATENCY_PRESETS.map((p) => (
                                <option key={p.value} value={p.value} className="bg-card">
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Override Response JSON
                            </label>
                            <textarea
                              value={rule.responseJsonString}
                              onChange={(e) => handleUpdateRuleResponseJson(index, e.target.value)}
                              className="w-full h-20 rounded border border-border bg-background px-2 py-1 text-[11px] font-mono text-foreground input-premium leading-relaxed"
                              placeholder='{"message": "override content"}'
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border border-border bg-card hover:bg-secondary rounded-lg text-sm font-medium transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-lg text-sm font-medium transition-opacity flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreateModalOpen ? "Add Endpoint" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && activeEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card rounded-xl border border-border p-6 shadow-xl z-50 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold tracking-tight text-foreground">Delete Mock Endpoint</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">{activeEndpoint.name}</span>? This action cannot be undone and will break client integrations calling <code className="font-mono text-xs">{activeEndpoint.path}</code>.
            </p>
            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-border bg-card hover:bg-secondary rounded-lg text-sm font-medium transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}