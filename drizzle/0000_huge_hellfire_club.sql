CREATE TABLE "coordinates" (
	"id" serial PRIMARY KEY NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
