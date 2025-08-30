CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"address" varchar(1000),
	"id_number" varchar(100),
	"id_type" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "facilities" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "is_available" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "room_number" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "floor_number" varchar(10) NOT NULL;