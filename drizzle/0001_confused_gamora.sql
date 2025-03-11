ALTER TABLE "coordinates" ALTER COLUMN "latitude" SET DATA TYPE numeric(10, 7);--> statement-breakpoint
ALTER TABLE "coordinates" ALTER COLUMN "longitude" SET DATA TYPE numeric(10, 7);--> statement-breakpoint
ALTER TABLE "coordinates" ADD COLUMN "game_map" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "coordinates" ADD COLUMN "hint_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "coordinates" ADD COLUMN "hint" varchar(255) NOT NULL;