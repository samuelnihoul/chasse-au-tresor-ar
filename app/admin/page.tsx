'use client';

import { useState, useEffect } from 'react';
import AdminProtection from '../components/AdminProtection';
import StoreCoordinatesButton from '../components/StoreCoordinatesButton';

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

export default function AdminPage() {
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
        <AdminProtection>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Administration</h1>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Enregistrement des coordonnées</h2>
                    <StoreCoordinatesButton />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Liste des coordonnées</h2>
                    <div className="space-y-4">
                        {coordinates.map((coord) => (
                            <div key={coord.id} className="border p-4 rounded-lg shadow">
                                <p>Latitude: {coord.latitude}</p>
                                <p>Longitude: {coord.longitude}</p>
                                <p>Zone: {coord.zoneId}</p>
                                <p>Créé le: {new Date(coord.createdAt).toLocaleString()}</p>

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
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(coord.id)}
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                >
                                                    Sauvegarder
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
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
            </div>
        </AdminProtection>
    );
}