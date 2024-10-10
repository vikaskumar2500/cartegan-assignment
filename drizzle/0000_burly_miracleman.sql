CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"password" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
