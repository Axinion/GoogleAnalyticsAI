ALTER TABLE "websites" ADD COLUMN "timezone" varchar(100) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "local_tracking" boolean DEFAULT false NOT NULL;