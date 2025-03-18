'use client';

import { useState, useEffect } from 'react';

interface Coordinate {
    id: number;
    latitude: number;
    longitude: number;
    createdAt: string;
    hintNumber: number;
    hint: string;
    gameMap: string;
}

export default function Admin() {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        hintNumber: 0,
        hint: '',
        gameMap: ''
    });

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
        const interval = setInterval(fetchCoordinates, 100000);
        return () => clearInterval(interval);
    }, []);

    const handleEdit = (coord: Coordinate) => {
        setEditingId(coord.id);
        setEditForm({
            hintNumber: coord.hintNumber,
            hint: coord.hint,
            gameMap: coord.gameMap
        });
    };

    const handleSave = async (id: number) => {
        try {
            const response = await fetch('/api/store-coordinates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...editForm
                }),
            });

            if (response.ok) {
                setEditingId(null);
                // Refresh coordinates
                const response = await fetch('/api/store-coordinates');
                const data = await response.json();
                setCoordinates(data);
            }
        } catch (error) {
            console.error('Error updating coordinate:', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="space-y-4">
                {coordinates.map((coord) => (
                    <div key={coord.id} className="border p-4 rounded-lg shadow">
                        <p>Latitude: {coord.latitude}</p>
                        <p>Longitude: {coord.longitude}</p>
                        <p>Created: {new Date(coord.createdAt).toLocaleString()}</p>

                        {editingId === coord.id ? (
                            <>
                                <div className="space-y-2 mt-2">
                                    <input
                                        type="number"
                                        value={editForm.hintNumber}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            hintNumber: e.target.value === '' ? 0 : parseInt(e.target.value)
                                        })}
                                        className="border p-1 w-full"
                                        placeholder="Numéro de l'indice"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.hint}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            hint: e.target.value
                                        })}
                                        className="border p-1 w-full"
                                        placeholder="Indice"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.gameMap}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            gameMap: e.target.value
                                        })}
                                        className="border p-1 w-full"
                                        placeholder="Carte du jeu"
                                    />
                                    <button
                                        onClick={() => handleSave(coord.id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        Sauvegarder
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Indice: {coord.hint}</p>
                                <p>Carte du jeu: {coord.gameMap}</p>
                                <p>Numéro de l'indice: {coord.hintNumber}</p>
                                <button
                                    onClick={() => handleEdit(coord)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                >
                                    Modifier
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}