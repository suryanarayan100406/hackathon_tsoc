-- Add multilingual support to Content table
ALTER TABLE "Content" ADD COLUMN "titleJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Content" ADD COLUMN "descJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Content" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
