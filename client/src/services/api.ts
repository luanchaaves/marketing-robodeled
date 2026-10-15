import axios, { AxiosError } from 'axios';

// Create configured Axios instance
export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  getMe: () => api.get('/auth/me'),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  setupAdmin: (data: any) => api.post('/auth/setup-admin', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

export const dashboardApi = {
  getSummary: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    api.get('/dashboard/summary', { params }),
};

export const leadsApi = {
  getAll: (params?: any) => api.get('/leads', { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  addActivity: (id: string, data: any) => api.post(`/leads/${id}/activities`, data),
  addTask: (id: string, data: any) => api.post(`/leads/${id}/tasks`, data),
  updateTask: (leadId: string, taskId: string, data: any) =>
    api.put(`/leads/${leadId}/tasks/${taskId}`, data),
  importCsv: (formData: FormData) =>
    api.post('/leads/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportCsv: (params?: any) =>
    api.get('/leads/export', { params, responseType: 'blob' }),
};

export const campaignsApi = {
  getAll: () => api.get('/campaigns'),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  addExpense: (campaignId: string, data: any) =>
    api.post(`/campaigns/${campaignId}/expenses`, data),
};

export const metaAdsApi = {
  getAccounts: () => api.get('/meta-ads/accounts'),
  sync: () => api.post('/meta-ads/sync'),
  getMetrics: (params?: any) => api.get('/meta-ads/metrics', { params }),
};

export const instagramApi = {
  getMedia: (params?: any) => api.get('/instagram/media', { params }),
  createMedia: (data: any) => api.post('/instagram/media', data),
  deleteMedia: (id: string) => api.delete(`/instagram/media/${id}`),
  getPosts: (params?: any) => api.get('/instagram/posts', { params }),
  createPost: (data: any) => api.post('/instagram/posts', data),
  updatePost: (id: string, data: any) => api.put(`/instagram/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/instagram/posts/${id}`),
};

export const automationsApi = {
  getRules: () => api.get('/automations/rules'),
  createRule: (data: any) => api.post('/automations/rules', data),
  toggleRule: (id: string, active: boolean) => api.put(`/automations/rules/${id}/toggle`, { active }),
  testRule: (id: string) => api.post(`/automations/rules/${id}/test`),
};

export const reportsApi = {
  getPerformanceReport: (params?: any) => api.get('/reports/performance', { params }),
};

export const integrationsApi = {
  getAll: () => api.get('/integrations'),
  save: (provider: string, data: any) => api.post(`/integrations/${provider}`, data),
  test: (provider: string) => api.post(`/integrations/${provider}/test`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  invite: (data: any) => api.post('/users/invite', data),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
};

export const auditApi = {
  getLogs: (params?: any) => api.get('/audit', { params }),
};

export const aiApi = {
  generate: (data: { prompt: string; task?: string }) => api.post('/ai/generate', data),
};

export default api;
