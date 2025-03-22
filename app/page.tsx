// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UserLocation from './components/UserLocation';
import CameraFeed from './components/CamFeed';
import StoreCoordinatesButton from './components/StoreCoordinatesButton';

interface Coordinate {
    id: number;
    latitude: number;
    longitude: number;
    createdAt: string;
    hintNumber: number;
    hint: string;
    gameMap: string;
    zoneId: string;
}

export default function Home() {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                const response = await fetch('/api/store-coordinates');
                const data = await response.json();
                setCoordinates(data);
            } catch (error) {
                console.error('Error fetching coordinates:', error);
            }
        };

        // Première récupération
        fetchCoordinates();

        // Mise à jour toutes les 2 secondes
        const interval = setInterval(fetchCoordinates, 2000);

        // Nettoyage à la destruction du composant
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex-1 relative">
                <CameraFeed />
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-4">
                    <UserLocation />
                    <StoreCoordinatesButton />

                </div>
            </div>
        </div>
    );
}