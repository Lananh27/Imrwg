/*
  Warnings:

  - You are about to drop the column `documentUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "documentUrl",
DROP COLUMN "imageUrl",
DROP COLUMN "location",
DROP COLUMN "period",
DROP COLUMN "role",
DROP COLUMN "summary",
ADD COLUMN     "bullets" JSONB,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "membersCount" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "readMoreLink" TEXT,
ADD COLUMN     "researchArea" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'In Progress',
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "yearRange" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
