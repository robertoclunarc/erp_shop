import api from './axiosConfig';

// Tipos
export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  category_id: number;
  category_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  duration_minutes?: number;
  price: number;
  category_id: number;
}

export const serviceService = {
  list: async (params?: { search?: string; category_id?: number }) => {
    const response = await api.get<Service[]>('/services', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceData) => {
    const response = await api.post<{ id: number; message: string }>('/services', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateServiceData>) => {
    const response = await api.put<{ message: string }>(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/services/${id}`);
    return response.data;
  },
};