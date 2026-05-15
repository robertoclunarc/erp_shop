export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role_id: number;
  branches: number[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  hasPermission: (roles: number[]) => boolean;
  hasBranchAccess: (branchId: number) => boolean;
}