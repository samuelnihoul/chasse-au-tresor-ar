'use client';

import { useState } from 'react';

const StoreCoordinatesButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const handleAuthentication = () => {
        if (password === 'admin123') { // Mot de passe simple pour la démonstration
            setIsAuthenticated(true);
            setShowPasswordInput(false);
        } else {
            alert('Mot de passe incorrect');
        }
    };

    const handleStoreCoordinates = async () => {
        if (!isAuthenticated) {
            setShowPasswordInput(true);
            return;
        }

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsLoading(true);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;

            const response = await fetch('/api/store-coordinates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude, longitude }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to store coordinates');
            }

            alert('Coordinates stored successfully!');
        } catch (error) {
            console.error('Error storing coordinates:', error);
            alert('Error storing coordinates.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {showPasswordInput && !isAuthenticated && (
                <div className="flex flex-col items-center gap-2">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe admin"
                        className="px-3 py-2 border rounded"
                    />
                    <button
                        onClick={handleAuthentication}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Valider
                    </button>
                </div>
            )}
            <button
                onClick={handleStoreCoordinates}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? 'Storing...' : 'Enregistrer les coordonnées'}
            </button>
        </div>
    );
};

export default StoreCoordinatesButton;