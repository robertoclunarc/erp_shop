import api from './axiosConfig';

export interface Supplier {
  id: number;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_id: string | null;
}

export const supplierService = {
  list: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: Omit<Supplier, 'id'>): Promise<{ id: number; message: string }> => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<Supplier, 'id'>>): Promise<{ message: string }> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};