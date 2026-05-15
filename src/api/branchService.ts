import api from './axiosConfig';

export interface Branch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export const branchService = {
  list: async (): Promise<Branch[]> => {
    const response = await api.get('/branches');
    return response.data;
  },

  getById: async (id: number): Promise<Branch> => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  create: async (data: Omit<Branch, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<{ id: number }> => {
    const response = await api.post('/branches', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<Branch, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    await api.put(`/branches/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },
};