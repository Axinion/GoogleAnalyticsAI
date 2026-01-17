CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_data" json,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "page_load_time" integer;--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "dom_ready_time" integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "region" varchar(100);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "browser_version" varchar(50);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "os_version" varchar(50);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "timezone" varchar(100);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "language" varchar(10);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "screen_resolution" varchar(20);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "viewport" varchar(20);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "active_time" integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "is_live_user" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "last_activity" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;