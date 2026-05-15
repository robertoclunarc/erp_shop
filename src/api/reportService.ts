import api from './axiosConfig';

export const reportService = {
  getSalesByDay: async (params: { branch_id: number; start_date?: string; end_date?: string; limit?: number }) => {
    const response = await api.get('/reports/sales-by-day', { params });
    return response.data;
  },
  getTopProducts: async (params: { branch_id: number; limit?: number }) => {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  },
  getTopServices: async (params: { branch_id: number; limit?: number }) => {
    const response = await api.get('/reports/top-services', { params });
    return response.data;
  },
  getCashStatus: async (params: { branch_id: number }) => {
    const response = await api.get('/reports/cash-status', { params });
    return response.data;
  },
  getProfitLoss: async (params: { branch_id: number; start_date?: string; end_date?: string }) => {
    const response = await api.get('/reports/profit-loss', { params });
    return response.data;
  },
  getLowStock: async (params: { branch_id: number; threshold?: number }) => {
    const response = await api.get('/reports/low-stock', { params });
    return response.data;
  },
};