import type { Config } from 'drizzle-kit';

export default {
    schema: './db/schema.ts',
    out: './drizzle',
    driver: 'd1-http',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
} satisfies Config;