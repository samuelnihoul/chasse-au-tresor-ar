// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UserLocation from './components/UserLocation';
import CameraFeed from './components/CamFeed';
import StoreCoordinatesButton from './components/StoreCoordinatesButton';
import GameInstructions from './components/GameInstructions';
import { useZombies } from './hooks/useZombies';

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
    const { score } = useZombies();

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
            <h1 className='text-center text-3xl font-bold py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg transform hover:scale-105 transition-transform duration-300'>
                Enquête avec Youssouf
            </h1>
            <CameraFeed />
            <GameInstructions />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-4">
                <UserLocation />
                <StoreCoordinatesButton />
            </div>
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                <p className="font-bold">Score: {score}</p>
            </div>
        </div>
    );
}