import { serial, timestamp, pgTable, numeric } from 'drizzle-orm/pg-core';

export const coordinates = pgTable('coordinates', {
    id: serial('id').primaryKey(),
    latitude: numeric('latitude').notNull(),
    longitude: numeric('longitude').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});