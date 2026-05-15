import React, { useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/authService';
import { User } from '../types/user.types';
import { AuthContext } from './AuthContext';

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({
      username,
      password,
    });

    localStorage.setItem('token', response.token);

    localStorage.setItem(
      'user',
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasPermission = (roles: number[]): boolean => {
    if (!user) return false;

    return roles.includes(user.role_id);
  };

  const hasBranchAccess = (branchId: number): boolean => {
    if (!user) return false;

    if (user.role_id === 1) {
      return true;
    }

    return user.branches.includes(branchId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasBranchAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};