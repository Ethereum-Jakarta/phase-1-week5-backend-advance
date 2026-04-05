ALTER TABLE "messages" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "lastMessage" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "lastMessageSent" timestamp with time zone;