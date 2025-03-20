'use client';

import { useState } from 'react';
import GameZoneSelector from './GameZoneSelector';
import useAuth from '../hooks/useAuth';

const StoreCoordinatesButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const [selectedZone, setSelectedZone] = useState<string>();

    const handleStoreCoordinates = async () => {
        if (!isAuthenticated) {
            alert('Veuillez vous connecter en tant qu\'administrateur');
            return;
        }

        if (!selectedZone) {
            alert('Veuillez sélectionner une zone de jeu');
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
                body: JSON.stringify({
                    latitude,
                    longitude,
                    zoneId: selectedZone
                }),
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
            <GameZoneSelector
                onZoneSelect={setSelectedZone}
                currentZone={selectedZone}
            />
            <button
                onClick={handleStoreCoordinates}
                disabled={isLoading || !selectedZone || !isAuthenticated}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? 'Storing...' : 'Enregistrer les coordonnées'}
            </button>
        </div>
    );
};

export default StoreCoordinatesButton;