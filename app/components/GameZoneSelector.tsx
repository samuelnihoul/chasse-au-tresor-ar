'use client';

import { useState } from 'react';

interface GameZone {
    id: string;
    name: string;
    description: string;
}

const gameZones: GameZone[] = [
    { id: 'zone1', name: 'Zone 1', description: 'Première zone de jeu' },
    { id: 'zone2', name: 'Zone 2', description: 'Deuxième zone de jeu' },
    { id: 'zone3', name: 'Zone 3', description: 'Troisième zone de jeu' },
];

interface GameZoneSelectorProps {
    onZoneSelect: (zoneId: string) => void;
    currentZone?: string;
}

const GameZoneSelector: React.FC<GameZoneSelectorProps> = ({ onZoneSelect, currentZone }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
            >
                <span>
                    {currentZone
                        ? gameZones.find(zone => zone.id === currentZone)?.name
                        : 'Sélectionner une zone'}
                </span>
                <svg
                    className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                        {gameZones.map((zone) => (
                            <button
                                key={zone.id}
                                onClick={() => {
                                    onZoneSelect(zone.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${currentZone === zone.id ? 'bg-purple-50 text-purple-600' : ''
                                    }`}
                            >
                                <div className="font-medium">{zone.name}</div>
                                <div className="text-sm text-gray-500">{zone.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameZoneSelector; 