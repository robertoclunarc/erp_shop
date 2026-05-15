import api from './axiosConfig';

// Tipos
export interface SaleDetailItem {
  item_type: 'product' | 'service';
  item_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface CreateSaleData {
  branch_id: number;
  customer_id?: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
  discount?: number;
  tax?: number;
  notes?: string;
  items: SaleDetailItem[];
}

export interface Sale {
  id: number;
  sale_number: string;
  branch_id: number;
  cash_register_id: number;
  customer_id: number | null;
  customer_name?: string;
  user_id: number;
  user_name?: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  status: 'completed' | 'cancelled' | 'refunded';
  notes: string | null;
  created_at: string;
}

export interface SaleWithDetails extends Sale {
  details: {
    id: number;
    item_type: 'product' | 'service';
    item_id: number;
    item_name: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    total: number;
  }[];
}

export const saleService = {
  list: async (params?: { branch_id?: number; start_date?: string; end_date?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ data: Sale[]; total: number; page: number; lastPage: number }>('/sales', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<SaleWithDetails>(`/sales/${id}`);
    return response.data;
  },

  create: async (data: CreateSaleData) => {
    console.log('Creating sale with data:', data);
    const response = await api.post<{ saleId: number; message: string }>('/sales', data);
    return response.data;
  },

  cancel: async (id: number, reason: string) => {
    const response = await api.put<{ message: string }>(`/sales/${id}/cancel`, { reason });
    return response.data;
  },
};