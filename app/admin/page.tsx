'use client';

import { useState, useEffect } from 'react';
import AdminProtection from '../components/AdminProtection';
import StoreCoordinatesButton from '../components/StoreCoordinatesButton';
import GameZoneSelector from '../components/GameZoneSelector';

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
        gameMap: '',
        zoneId: ''
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
            gameMap: coord.gameMap,
            zoneId: coord.zoneId
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
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Administration</h1>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Enregistrement des coordonnées</h2>
                    <StoreCoordinatesButton />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Liste des coordonnées</h2>
                    <div className="space-y-4">
                        {coordinates.map((coord) => (
                            <div key={coord.id} className="border p-4 rounded-lg shadow">
                                <div className="text-gray-900">
                                    <p>Latitude: {coord.latitude}</p>
                                    <p>Longitude: {coord.longitude}</p>
                                    <p>Zone: {coord.zoneId}</p>
                                    <p>Créé le: {new Date(coord.createdAt).toLocaleString()}</p>
                                </div>

                                {editingId === coord.id ? (
                                    <>
                                        <div className="space-y-2 mt-2">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Zone de jeu
                                                </label>
                                                <GameZoneSelector
                                                    onZoneSelect={(zoneId) => setEditForm({ ...editForm, zoneId })}
                                                    currentZone={editForm.zoneId}
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                value={editForm.hintNumber}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    hintNumber: e.target.value === '' ? 0 : parseInt(e.target.value)
                                                })}
                                                className="border p-2 w-full rounded text-gray-900"
                                                placeholder="Numéro de l'indice"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.hint}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    hint: e.target.value
                                                })}
                                                className="border p-2 w-full rounded text-gray-900"
                                                placeholder="Indice"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.gameMap}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    gameMap: e.target.value
                                                })}
                                                className="border p-2 w-full rounded text-gray-900"
                                                placeholder="Carte du jeu"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(coord.id)}
                                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                >
                                                    Sauvegarder
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-gray-900">
                                            <p>Indice: {coord.hint}</p>
                                            <p>Carte du jeu: {coord.gameMap}</p>
                                            <p>Numéro de l'indice: {coord.hintNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => handleEdit(coord)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
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