-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "invalidNumbers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "messagesSent" INTEGER NOT NULL DEFAULT 0;
