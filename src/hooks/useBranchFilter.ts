import { useContext } from 'react';
import { BranchContext } from '../contexts/BranchContext';

export const useBranchFilter = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchFilter must be used within a BranchProvider');
  }
  return context;
};