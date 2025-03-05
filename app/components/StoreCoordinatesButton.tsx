'use client';

const StoreCoordinatesButton: React.FC = () => {
    const handleStoreCoordinates = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch('/api/store-coordinates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ latitude, longitude }),
                    });
                    if (!response.ok) {
                        throw new Error('Failed to store coordinates');
                    }
                    alert('Coordinates stored successfully!');
                } catch (error) {
                    console.error('Error storing coordinates:', error);
                    alert('Error storing coordinates.');
                }
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    return <button onClick={handleStoreCoordinates}>Store Coordinates</button>;
};

export default StoreCoordinatesButton;