'use client';

import { useState, useEffect } from 'react';
import AdminProtection from '../components/AdminProtection';
import UserLocation from '../components/UserLocation'
import StoreCoordinatesButton from '../components/StoreCoordinatesButton';
import HintCard from '../components/HintCard';
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
    const [editForm, setEditForm] = useState<Coordinate | null>(null);

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
        setEditForm({ ...coord });
    };

    const handleSave = async (id: number) => {
        if (!editForm) return;

        try {
            const response = await fetch('/api/store-coordinates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    hintNumber: editForm.hintNumber,
                    hint: editForm.hint,
                    gameMap: editForm.gameMap
                }),
            });

            if (response.ok) {
                // Mise à jour optimiste de l'interface
                setCoordinates(coordinates.map(coord =>
                    coord.id === id ? { ...coord, ...editForm } : coord
                ));
                setEditingId(null);
                setEditForm(null);
            } else {
                const error = await response.json();
                alert(`Erreur lors de la sauvegarde: ${error.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Error updating coordinate:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet indice ?')) {
            return;
        }

        try {
            const response = await fetch('/api/store-coordinates', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                setCoordinates(coordinates.filter(coord => coord.id !== id));
                alert('Indice supprimé avec succès');
            } else {
                const error = await response.json();
                alert(`Erreur lors de la suppression: ${error.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Error deleting coordinate:', error);
            alert('Erreur lors de la suppression');
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
                            <HintCard
                                key={coord.id}
                                coord={editingId === coord.id ? editForm! : coord}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                isEditing={editingId === coord.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}