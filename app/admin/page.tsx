'use client';

import { useState, useEffect } from 'react';
import AdminProtection from '../components/AdminProtection';
import UserLocation from '../components/UserLocation'
import StoreCoordinatesButton from '../components/StoreCoordinatesButton';
import { gameZones } from '../config/gameZones.config';

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
            gameMap: coord.zoneId,
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
                    ...editForm,
                    gameMap: editForm.zoneId
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
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-4">
                        <StoreCoordinatesButton />
                    </div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Liste des coordonnées</h2>
                    <div className="space-y-4">
                        {coordinates.map((coord) => (
                            <div key={coord.id} className="border p-4 rounded-lg shadow">
                                <div className="text-gray-900">
                                    <p>Latitude: {coord.latitude}</p>
                                    <p>Longitude: {coord.longitude}</p>
                                    <p>Créé le: {new Date(coord.createdAt).toLocaleString()}</p>
                                </div>

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
                                            <select
                                                value={editForm.zoneId}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    zoneId: e.target.value,
                                                    gameMap: e.target.value
                                                })}
                                                className="border p-2 w-full rounded text-gray-900"
                                            >
                                                <option value="">Sélectionner une zone</option>
                                                {gameZones.map((zone) => (
                                                    <option key={zone.id} value={zone.id}>
                                                        {zone.name} ({zone.difficulty})
                                                    </option>
                                                ))}
                                            </select>
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
                                            <p>Zone: {gameZones.find(zone => zone.id === coord.gameMap)?.name || coord.gameMap}</p>
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