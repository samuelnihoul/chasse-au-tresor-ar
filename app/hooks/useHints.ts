'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

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

interface HintState {
    hints: Coordinate[];
    currentHintIndex: number;
    loading: boolean;
    error: string | null;
    distanceToNextHint: number | null;
    setHints: (hints: Coordinate[]) => void;
    setCurrentHintIndex: (index: number) => void;
    setDistanceToNextHint: (distance: number | null) => void;
    nextHint: () => void;
    getCurrentHint: () => Coordinate | null;
    getNextHint: () => Coordinate | null;
}

export const useHints = create<HintState>((set, get) => ({
    hints: [],
    currentHintIndex: 0,
    loading: false,
    error: null,
    distanceToNextHint: null,
    
    setHints: (hints: Coordinate[]) => {
        // Trier les indices par numéro d'indice
        const sortedHints = [...hints].sort((a, b) => a.hintNumber - b.hintNumber);
        set({ hints: sortedHints });
    },
    
    setCurrentHintIndex: (index: number) => {
        set({ currentHintIndex: index });
    },
    
    setDistanceToNextHint: (distance: number | null) => {
        set({ distanceToNextHint: distance });
    },
    
    nextHint: () => {
        const { currentHintIndex, hints } = get();
        if (currentHintIndex < hints.length - 1) {
            set({ currentHintIndex: currentHintIndex + 1 });
        }
    },
    
    getCurrentHint: () => {
        const { hints, currentHintIndex } = get();
        return hints.length > 0 && currentHintIndex < hints.length 
            ? hints[currentHintIndex] 
            : null;
    },
    
    getNextHint: () => {
        const { hints, currentHintIndex } = get();
        return hints.length > 0 && currentHintIndex < hints.length - 1 
            ? hints[currentHintIndex + 1] 
            : null;
    }
}));

// Hook pour calculer la distance entre deux points géographiques
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance en mètres
};
