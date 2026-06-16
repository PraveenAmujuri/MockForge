"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard,
  FolderKanban,
  FileCode2,
  Terminal,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Loader2,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const {
    user,
    isAuthenticated,
    checkAuth,
    projects,
    fetchProjects,
    currentProject,
    fetchProject,
    logout
  } = useStore();
  
  const { theme, setTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Get current project slug from URL if it exists
  const projectSlug = params.projectSlug as string;

  useEffect(() => {
    checkAuth();
    setAuthChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/login");
    }
  }, [authChecked, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  useEffect(() => {
    // If slug is in parameters, load that project to set it as current
    if (projectSlug && isAuthenticated && (!currentProject || currentProject.slug !== projectSlug)) {
      const proj = projects.find(p => p.slug === projectSlug);
      if (proj) {
        fetchProject(proj.id);
      }
    }
  }, [projectSlug, projects, isAuthenticated, currentProject, fetchProject]);

  if (!authChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleProjectSelect = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setProjectDropdownOpen(false);
      router.push(`/dashboard/projects/${proj.slug}/endpoints`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Build navigation items dynamically based on whether a project context exists
  const navItems = projectSlug && currentProject
    ? [
        {
          name: "Project Overview",
          href: `/dashboard/projects/${projectSlug}`,
          icon: LayoutDashboard,
        },
        {
          name: "Endpoints",
          href: `/dashboard/projects/${projectSlug}/endpoints`,
          icon: FileCode2,
        },
        {
          name: "Request Logs",
          href: `/dashboard/projects/${projectSlug}/logs`,
          icon: Terminal,
        },
        {
          name: "Project Settings",
          href: `/dashboard/projects/${projectSlug}/settings`,
          icon: Settings,
        },
      ]
    : [
        {
          name: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Projects",
          href: "/dashboard/projects",
          icon: FolderKanban,
        },
        {
          name: "Account Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-card border-r border-border/60">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm select-none">
              M
            </div>
            <span className="font-semibold text-base tracking-tight text-foreground">MockForge</span>
          </Link>
          <button
            className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Selector */}
        <div className="relative px-1">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/80 bg-background/50 text-sm font-medium hover:bg-secondary/40 transition-colors"
          >
            <span className="truncate max-w-[130px]">
              {projectSlug && currentProject ? currentProject.name : "All Projects"}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground flex-shrink-0" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 py-1 rounded-lg border border-border bg-card shadow-lg z-50 max-h-56 overflow-y-auto">
              <Link
                href="/dashboard/projects"
                onClick={() => setProjectDropdownOpen(false)}
                className="w-full flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/40 hover:text-foreground hover:bg-secondary/40"
              >
                View All Projects
              </Link>
              {projects.length === 0 ? (
                <div className="px-3 py-2.5 text-xs text-muted-foreground italic">No projects created.</div>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProjectSelect(p.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors truncate ${
                      currentProject?.id === p.id ? "bg-secondary/80 font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {p.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="space-y-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Area */}
      <div className="border-t border-border/50 pt-4 space-y-3 px-1">
        <div className="px-3 py-1 text-xs text-muted-foreground truncate" title={user?.email}>
          {user?.email}
        </div>
        <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border/30">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 py-1 rounded-md flex items-center justify-center transition-all ${
              theme === "light" ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 py-1 rounded-md flex items-center justify-center transition-all ${
              theme === "dark" ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-150">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="h-screen sticky top-0">{sidebarContent}</div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-border/60 bg-card px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs">
              M
            </div>
            <span className="font-semibold text-sm">MockForge</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            {/* Sidebar drawer */}
            <div className="relative w-64 max-w-xs h-full bg-card z-50 shadow-2xl animate-in slide-in-from-left duration-200">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
