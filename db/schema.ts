import { serial, timestamp, pgTable, decimal, varchar, integer } from 'drizzle-orm/pg-core';

export const coordinates = pgTable('coordinates', {
    id: serial('id').primaryKey(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    gameMap: varchar('game_map', { length: 255 }).notNull().default("pas encore défini"),
    hintNumber: integer('hint_number').notNull().default(-1),
    hint: varchar('hint', { length: 255 }).notNull().default("pas encore défini")
});