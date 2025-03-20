'use client';
// app/components/UserLocation.ts
import React, { useEffect, useState } from 'react';

interface Location {
    latitude: number | null;
    longitude: number | null;
}

const UserLocation: React.FC = () => {
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [distanceToNorthPole, setDistanceToNorthPole] = useState<number | null>(null);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    calculateDistanceToNorthPole(latitude);
                });
            } else {
                alert("La géolocalisation n'est pas supportée par ce navigateur.");
            }
        };

        getLocation();
    }, []);

    const calculateDistanceToNorthPole = (latitude: number) => {
        const northPoleLatitude = 90;
        const latitudeInRadians = (latitude * Math.PI) / 180;
        const northPoleLatitudeInRadians = (northPoleLatitude * Math.PI) / 180;
        // formule de Harvesine pour calculer la distance entre deux points sur une sphère
        const distance = 6371 * Math.acos(
            Math.sin(latitudeInRadians) * Math.sin(northPoleLatitudeInRadians) +
            Math.cos(latitudeInRadians) * Math.cos(northPoleLatitudeInRadians)
        );
        setDistanceToNorthPole(distance);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Coordonnées de l'utilisateur</h2>
            {location.latitude !== null && location.longitude !== null ? (
                <>
                    <p>Latitude : {location.latitude}</p>
                    <p>Longitude : {location.longitude}</p>
                    <p>Distance au prochain indice {distanceToNorthPole?.toFixed(2)} km</p>
                </>
            ) : (
                <p>Obtention des coordonnées...</p>
            )}
        </div>
    );
};

export default UserLocation;