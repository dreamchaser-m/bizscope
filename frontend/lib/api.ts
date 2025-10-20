import axios from 'axios';
import type { Keyword, BusinessResult, StatusResponse } from './store';

// Use empty string for browser (will use current origin), localhost for SSR
const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const keywordsApi = {
  getAll: async (): Promise<Keyword[]> => {
    const response = await api.get('/api/keywords');
    return response.data;
  },
  create: async (keyword: string): Promise<Keyword> => {
    const response = await api.post('/api/keywords', { keyword });
    return response.data;
  },
  update: async (id: number, keyword: string): Promise<Keyword> => {
    const response = await api.put(`/api/keywords/${id}`, { keyword });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/keywords/${id}`);
  },
};

export const resultsApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    business_name?: string;
    business_status?: string;
    keyword?: string;
    naics_code?: string;
  }): Promise<{
    results: BusinessResult[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const response = await api.get('/api/results', { params });
    return response.data;
  },
  getById: async (id: number): Promise<BusinessResult> => {
    const response = await api.get(`/api/results/${id}`);
    return response.data;
  },
  update: async (keyword?: string): Promise<void> => {
    const params = keyword ? { keyword } : {};
    await api.post('/api/results/update', null, { params });
  },
};

export const statusApi = {
  get: async (): Promise<StatusResponse> => {
    const response = await api.get('/api/status');
    return response.data;
  },
};
