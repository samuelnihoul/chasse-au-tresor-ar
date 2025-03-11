'use client';

import { useState, useEffect } from 'react';

interface Coordinate {
    id: number;
    latitude: number;
    longitude: number;
    createdAt: string;
}

export default function Admin() {
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

        fetchCoordinates();
        const interval = setInterval(fetchCoordinates, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="space-y-4">
                {coordinates.map((coord) => (
                    <div key={coord.id} className="border p-4 rounded-lg shadow">
                        <p>Latitude: {coord.latitude}</p>
                        <p>Longitude: {coord.longitude}</p>
                        <p>Created: {new Date(coord.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}