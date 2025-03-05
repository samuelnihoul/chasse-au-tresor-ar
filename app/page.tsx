// app/page.tsx
import React from 'react';
import UserLocation from './components/UserLocation';
import CameraFeed from './components/CamFeed';
import StoreCoordinatesButton from './components/StoreCoordinatesButton';   

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Bienvenue à la chasse au trésor !</h1>
            <UserLocation />
            <CameraFeed />
            <StoreCoordinatesButton />
        </div>
    );
};

export default HomePage;