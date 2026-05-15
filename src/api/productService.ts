import api from './axiosConfig';

// Tipos
export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  category_id: number;
  category_name?: string;
  unit: string;
  purchase_price: number;
  sale_price: number;
  min_stock: number;
  current_stock: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface ProductListItem {
  data: Product[];
  total: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category_id: number;
  unit?: string;
  purchase_price: number;
  sale_price: number;
  min_stock?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  type: 'product' | 'service' | 'both';
}

export const productService = {
  list: async (branchId?: number, params?: { search?: string; category_id?: number }) => {
    const response = await api.get<ProductListItem>('/products', {
      params: { ...params, branch_id: branchId },
    });
    //console.log(response.data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    //console.log(response);
    return response.data;
  },

  create: async (data: CreateProductData) => {
    const response = await api.post<{ id: number; message: string }>('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProductData>) => {
    const response = await api.put<{ message: string }>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },

  // Categorías
  listCategories: async () => {
    const response = await api.get<Category[]>('/products/categories/all');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string; type?: 'product' | 'service' | 'both' }) => {
    const response = await api.post<{ id: number; message: string }>('/products/categories', data);
    return response.data;
  },
};