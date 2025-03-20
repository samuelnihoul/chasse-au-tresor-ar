'use client';

import { useState } from 'react';
import useAuth from '../hooks/useAuth';

interface AdminProtectionProps {
    children: React.ReactNode;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ children }) => {
    const { isAuthenticated, authenticate, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthentication = () => {
        const success = authenticate(password);
        if (success) {
            setError('');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    if (isAuthenticated) {
        return (
            <div className="relative">
                <button
                    onClick={logout}
                    className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                    Déconnexion
                </button>
                {children}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-xl font-semibold mb-4">Accès Administrateur</div>
            <div className="flex flex-col items-center gap-2">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe admin"
                    className="px-3 py-2 border rounded"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAuthentication();
                        }
                    }}
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                    onClick={handleAuthentication}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Valider
                </button>
            </div>
        </div>
    );
};

export default AdminProtection; 