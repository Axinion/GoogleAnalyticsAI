CREATE TABLE "usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period" varchar(7) NOT NULL,
	"websites_count" integer DEFAULT 0 NOT NULL,
	"sessions_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usage_user_id_period_pk" PRIMARY KEY("user_id","period")
);
--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "avg_time_on_page" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "unique_pages" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "device_breakdown" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "browser_breakdown" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "os_breakdown" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "country_breakdown" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "event_breakdown" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "top_pages" json;--> statement-breakpoint
ALTER TABLE "analytics_summary" ADD COLUMN "top_referrers" json;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_websites" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_sessions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_price_id" varchar(100);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "clerk_plan_id" varchar(100);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "is_popular" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "clerk_subscription_id" varchar(100);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;