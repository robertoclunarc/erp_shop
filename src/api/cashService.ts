import api from './axiosConfig';
import { CashRegister, OpenCashRegisterData, CashMovement } from '../types/cash.types';

export const cashService = {
  getStatus: async (branchId: number): Promise<{ open: boolean; cashRegister: CashRegister | null }> => {
    const response = await api.get(`/cash-register/status?branch_id=${branchId}`);
    return response.data;
  },
  open: async (data: OpenCashRegisterData): Promise<{ cashRegisterId: number }> => {
    const response = await api.post('/cash-register/open', data);
    return response.data;
  },
  close: async (id: number, closing_amount: number): Promise<void> => {
    await api.post(`/cash-register/close/${id}`, { closing_amount });
  },
  getMovements: async (cashRegisterId: number, params?: { startDate?: string; endDate?: string }): Promise<CashMovement[]> => {
    console.log(params);
    const response = await api.get(`/cash-register/${cashRegisterId}/movements`, { params });
    return response.data;
  },
};