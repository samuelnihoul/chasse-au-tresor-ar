import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAllCoordinates } from '@/db/queries';

// Retrieve the connection string from environment variables
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
});

export async function POST(req: NextRequest) {
    try {
        const { latitude, longitude } = await req.json();
        console.log('Received coordinates:', latitude, longitude);

        await pool.query(
            'INSERT INTO coordinates (latitude, longitude) VALUES ($1, $2)',
            [latitude, longitude]
        );

        return NextResponse.json({ message: 'Coordinates stored successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Error storing coordinates:', error);
        return NextResponse.json({ message: 'Error storing coordinates.' }, { status: 500 });
    }
}
export async function GET() {
    try {
        const coordinates = await getAllCoordinates();
        return NextResponse.json(coordinates);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch coordinates' },
            { status: 500 }
        );
    }
}