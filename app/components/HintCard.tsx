'use client';

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

interface HintCardProps {
    coord: Coordinate;
    onEdit: (coord: Coordinate) => void;
    onDelete: (id: number) => void;
    onSave: (id: number) => void;
    onCancel: () => void;
    isEditing: boolean;
}

const HintCard: React.FC<HintCardProps> = ({ coord, onEdit, onDelete, onSave, onCancel, isEditing }) => {
    return (
        <div className="border p-4 rounded-lg shadow">
            <div className="text-gray-900">
                <p>Latitude: {coord.latitude}</p>
                <p>Longitude: {coord.longitude}</p>
                <p>Créé le: {new Date(coord.createdAt).toLocaleString()}</p>
            </div>

            {isEditing ? (
                <div className="space-y-2 mt-2">
                    <input
                        type="number"
                        value={coord.hintNumber}
                        onChange={(e) => onEdit({
                            ...coord,
                            hintNumber: e.target.value === '' ? 0 : parseInt(e.target.value)
                        })}
                        className="border p-2 w-full rounded text-gray-900"
                        placeholder="Numéro de l'indice"
                    />
                    <input
                        type="text"
                        value={coord.hint}
                        onChange={(e) => onEdit({
                            ...coord,
                            hint: e.target.value
                        })}
                        className="border p-2 w-full rounded text-gray-900"
                        placeholder="Indice"
                    />
                    <select
                        value={coord.zoneId}
                        onChange={(e) => onEdit({
                            ...coord,
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
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => onSave(coord.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Sauvegarder
                        </button>
                        <button
                            onClick={onCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-gray-900">
                        <p>Indice: {coord.hint}</p>
                        <p>Zone: {gameZones.find(zone => zone.id === coord.gameMap)?.name || coord.gameMap}</p>
                        <p>Numéro de l'indice: {coord.hintNumber}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => onEdit(coord)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={() => onDelete(coord.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Supprimer
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default HintCard; 