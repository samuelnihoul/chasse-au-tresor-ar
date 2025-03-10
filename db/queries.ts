import { desc } from 'drizzle-orm';
import db from './drizzle'
import { coordinates } from './schema';

export async function getAllCoordinates() {
    try {
        const allCoordinates = await db
            .select()
            .from(coordinates)
            .orderBy(desc(coordinates.createdAt));

        return allCoordinates;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        throw error;
    }
}

