-- AlterTable
ALTER TABLE "Quest" ADD COLUMN "passMark" INTEGER NOT NULL DEFAULT 70;
ALTER TABLE "Quest" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'QUIZ';

-- Update existing quests to have proper type
UPDATE "Quest" SET "type" = 'QUIZ' WHERE "type" IS NULL OR "type" = '';
