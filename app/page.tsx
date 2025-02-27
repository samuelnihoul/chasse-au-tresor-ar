// app/page.tsx
import React from 'react';
import UserLocation from './components/UserLocation';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Bienvenue à la chasse au trésor !</h1>
            <UserLocation />
        </div>
    );
};

export default HomePage;