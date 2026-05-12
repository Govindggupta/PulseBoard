ALTER TABLE "polls" ALTER COLUMN "id" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "poll_id" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "poll_id" SET DATA TYPE varchar(8);