import api from './axiosConfig';

// Tipos
export interface PurchaseDetail {
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreatePurchaseData {
  supplier_id: number;
  branch_id: number;
  payment_method: 'cash' | 'card' | 'transfer';
  discount?: number;
  tax?: number;
  notes?: string;
  items: PurchaseDetail[];
}

export interface Purchase {
  id: number;
  purchase_number: string;
  supplier_id: number;
  supplier_name?: string;
  branch_id: number;
  user_id: number;
  user_name?: string;
  purchase_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  status: 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface PurchaseWithDetails extends Purchase {
  details: (PurchaseDetail & { product_name: string; sku: string })[];
}

export const purchaseService = {
  list: async (params?: { branch_id?: number; start_date?: string; end_date?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ data: Purchase[]; total: number; page: number; lastPage: number }>('/purchases', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<PurchaseWithDetails>(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseData) => {
    const response = await api.post<{ purchaseId: number; message: string }>('/purchases', data);
    return response.data;
  },

  cancel: async (id: number, reason: string) => {
    const response = await api.put<{ message: string }>(`/purchases/${id}/cancel`, { reason });
    return response.data;
  },
  
  update: async (id: number, data: { status: string }): Promise<{ message: string }> => {
    //console.log('Updating purchase status:', { id, data });
    const response = await api.put(`/purchases/${id}`, data);
    return response.data;
  },
};