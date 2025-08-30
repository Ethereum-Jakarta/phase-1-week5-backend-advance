ALTER TABLE "bookings" ALTER COLUMN "room_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "number_of_guests" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "special_requests" varchar(1000);