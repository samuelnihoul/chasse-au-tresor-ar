// app/page.tsx
import React from 'react';
import UserLocation from './components/UserLocation';
import CameraFeed from './components/CamFeed';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Bienvenue à la chasse au trésor !</h1>
            <UserLocation />
            <CameraFeed />
        </div>
    );
};

export default HomePage;