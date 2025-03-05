import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Retrieve the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { latitude, longitude } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO coordinates (latitude, longitude) VALUES ($1, $2)',
                [latitude, longitude]
            );
            res.status(200).json({ message: 'Coordinates stored successfully!' });
        } catch (error) {
            console.error('Error storing coordinates:', error);
            res.status(500).json({ message: 'Error storing coordinates.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}