'use client';

import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    authenticate: (password: string) => boolean;
    logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
    isAuthenticated: false,
    authenticate: (password: string) => {
        if (password === 'admin123') {
            set({ isAuthenticated: true });
            return true;
        }
        return false;
    },
    logout: () => {
        set({ isAuthenticated: false });
    },
}));

export default useAuth; 