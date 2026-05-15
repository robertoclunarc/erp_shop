import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { branchService, Branch } from '../api/branchService';

interface BranchContextType {
  selectedBranch: number | null;
  setSelectedBranch: (branchId: number | null) => void;
  availableBranches: Branch[];
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      // Si el usuario es ADMIN, carga todas las sucursales; si no, solo las asignadas
      if (user.role_id === 1) {
        branchService.list().then(setAvailableBranches);
      } else {
        // Asumiendo que el backend devuelve las sucursales del usuario en user.branches
        // Necesitamos obtener los detalles de esas sucursales
        const fetchBranches = async () => {
          const all = await branchService.list();
          const userBranches = all.filter(b => user.branches.includes(b.id));
          setAvailableBranches(userBranches);
        };
        fetchBranches();
      }
    }
  }, [user]);

  // Seleccionar automáticamente la primera sucursal si solo hay una
  useEffect(() => {
    if (availableBranches.length === 1 && !selectedBranch) {
      setSelectedBranch(availableBranches[0].id);
    }
  }, [availableBranches, selectedBranch]);

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, availableBranches }}>
      {children}
    </BranchContext.Provider>
  );
};