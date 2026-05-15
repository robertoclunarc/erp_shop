import api from './axiosConfig';

// Tipos
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
  status: 'active' | 'inactive';
  branches: number[];
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id: number;
  branches: number[];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  role_id?: number;
  status?: 'active' | 'inactive';
  branches?: number[];
}

export const userService = {
  list: async (params?: { role_id?: number; branch_id?: number }) => {
    const response = await api.get<User[]>('/users', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData) => {
    const response = await api.post<{ id: number; message: string }>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserData) => {
    const response = await api.put<{ message: string }>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
};