// app/page.tsx
import React from 'react';
import UserLocation from './components/UserLocation';
import CameraFeed from './components/CamFeed';
import StoreCoordinatesButton from './components/StoreCoordinatesButton';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <h1 className="text-2xl font-bold p-4 text-center">Bienvenue à la chasse au trésor !</h1>
            <div className="flex-1 flex items-center justify-center">
                <CameraFeed />
            </div>
            <div className="p-4 space-y-4">
                <UserLocation />
                <StoreCoordinatesButton />
            </div>
        </div>
    );
};

export default HomePage;