export interface CashRegister {
  id: number;
  branch_id: number;
  opening_amount: number;
  closing_amount: number | null;
  difference: number | null;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  opened_by: number;
  closed_by: number | null;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}

export interface OpenCashRegisterData {
  branch_id: number;
  opening_amount: number;
  opened_by: number;
}

export interface CloseCashRegisterData {
  id: number;
  closing_amount: number;
  closed_by: number;
}

export interface CashMovement {
  id: number;
  cash_register_id: number;
  movement_type: 'INGRESO' | 'EGRESO';
  amount: number;
  concept: string;
  reference_type: string | null;
  reference_id: number | null;
  payment_method: 'cash' | 'card' | 'transfer';
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
}