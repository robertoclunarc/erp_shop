import { createContext } from 'react';
import { AuthContextType } from '../types/user.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);