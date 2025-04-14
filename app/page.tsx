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
    const [isModalOpen, setIsModalOpen] = useState(false);
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

            {/* Bouton d'information */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="mt-4">
                            <UserLocation />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}