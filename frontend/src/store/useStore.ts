import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  isPublic: boolean;
  createdAt: string;
  _count?: {
    endpoints: number;
  };
}

export interface MockEndpoint {
  id: string;
  projectId: string;
  name: string;
  path: string;
  method: string;
  responseJson: any;
  statusCode: number;
  delayMs: number;
  createdAt: string;
}

export interface RequestLog {
  id: string;
  endpointId: string;
  method: string;
  headers: any;
  body: any;
  ipAddress: string;
  createdAt: string;
  endpoint?: {
    name: string;
    path: string;
    method: string;
  };
}

interface StoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;

  projects: Project[];
  currentProject: Project | null;
  isLoadingProjects: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  createProject: (name: string, isPublic?: boolean) => Promise<Project | null>;
  updateProject: (id: string, name?: string, isPublic?: boolean) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  regenerateApiKey: (id: string) => Promise<string | null>;

  endpoints: MockEndpoint[];
  isLoadingEndpoints: boolean;
  fetchEndpoints: (projectId: string) => Promise<void>;
  createEndpoint: (data: { projectId: string; name: string; path: string; method: string; responseJson: any; statusCode: number; delayMs: number }) => Promise<MockEndpoint | null>;
  updateEndpoint: (id: string, data: Partial<MockEndpoint>) => Promise<void>;
  deleteEndpoint: (id: string) => Promise<void>;
  duplicateEndpoint: (id: string) => Promise<void>;

  logs: RequestLog[];
  isLoadingLogs: boolean;
  fetchLogs: (projectId: string) => Promise<void>;
  clearLogs: (projectId: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  authError: null,

  login: async (email, password) => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('mockforge_token', access_token);
      localStorage.setItem('mockforge_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true, isLoadingAuth: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to login';
      set({ authError: errMsg, isLoadingAuth: false });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const res = await api.post('/auth/register', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('mockforge_token', access_token);
      localStorage.setItem('mockforge_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true, isLoadingAuth: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to register';
      set({ authError: errMsg, isLoadingAuth: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('mockforge_token');
    localStorage.removeItem('mockforge_user');
    set({ user: null, token: null, isAuthenticated: false, projects: [], currentProject: null, endpoints: [], logs: [] });
  },

  checkAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mockforge_token');
      const userStr = localStorage.getItem('mockforge_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    }
  },

  projects: [],
  currentProject: null,
  isLoadingProjects: false,

  fetchProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const res = await api.get('/projects');
      set({ projects: res.data, isLoadingProjects: false });
    } catch (err) {
      set({ isLoadingProjects: false });
    }
  },

  fetchProject: async (id) => {
    set({ isLoadingProjects: true });
    try {
      const res = await api.get(`/projects/${id}`);
      set({ currentProject: res.data, endpoints: res.data.endpoints || [], isLoadingProjects: false });
      return res.data;
    } catch (err) {
      set({ isLoadingProjects: false });
      return null;
    }
  },

  createProject: async (name, isPublic = false) => {
    try {
      const res = await api.post('/projects', { name, isPublic });
      set((state) => ({ projects: [res.data, ...state.projects] }));
      return res.data;
    } catch (err) {
      return null;
    }
  },

  updateProject: async (id, name, isPublic) => {
    try {
      const res = await api.put(`/projects/${id}`, { name, isPublic });
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...res.data } : p)),
        currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...res.data } : state.currentProject,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  regenerateApiKey: async (id) => {
    try {
      const res = await api.post(`/projects/${id}/regenerate-key`);
      const { apiKey } = res.data;
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, apiKey } : p)),
        currentProject: state.currentProject?.id === id ? { ...state.currentProject, apiKey } : state.currentProject,
      }));
      return apiKey;
    } catch (err) {
      return null;
    }
  },

  endpoints: [],
  isLoadingEndpoints: false,

  fetchEndpoints: async (projectId) => {
    set({ isLoadingEndpoints: true });
    try {
      const res = await api.get(`/endpoints/project/${projectId}`);
      set({ endpoints: res.data, isLoadingEndpoints: false });
    } catch (err) {
      set({ isLoadingEndpoints: false });
    }
  },

  createEndpoint: async (data) => {
    try {
      const res = await api.post('/endpoints', data);
      set((state) => ({ endpoints: [res.data, ...state.endpoints] }));
      return res.data;
    } catch (err: any) {
      throw err;
    }
  },

  updateEndpoint: async (id, data) => {
    try {
      const res = await api.put(`/endpoints/${id}`, data);
      set((state) => ({
        endpoints: state.endpoints.map((e) => (e.id === id ? res.data : e)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  deleteEndpoint: async (id) => {
    try {
      await api.delete(`/endpoints/${id}`);
      set((state) => ({
        endpoints: state.endpoints.filter((e) => e.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  duplicateEndpoint: async (id) => {
    try {
      const res = await api.post(`/endpoints/${id}/duplicate`);
      set((state) => ({ endpoints: [res.data, ...state.endpoints] }));
    } catch (err) {
      console.error(err);
    }
  },

  logs: [],
  isLoadingLogs: false,

  fetchLogs: async (projectId) => {
    set({ isLoadingLogs: true });
    try {
      const res = await api.get(`/logs/project/${projectId}`);
      set({ logs: res.data, isLoadingLogs: false });
    } catch (err) {
      set({ isLoadingLogs: false });
    }
  },

  clearLogs: async (projectId) => {
    try {
      await api.delete(`/logs/project/${projectId}`);
      set({ logs: [] });
    } catch (err) {
      console.error(err);
    }
  },
}));
