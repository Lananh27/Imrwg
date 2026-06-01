/*
  Warnings:

  - You are about to drop the column `projectBullets` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectDescription` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectImage` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectReadMoreLink` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectSectionTitle` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectSubtitle` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `projectTitle` on the `HomeContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeContent" DROP COLUMN "projectBullets",
DROP COLUMN "projectDescription",
DROP COLUMN "projectImage",
DROP COLUMN "projectReadMoreLink",
DROP COLUMN "projectSectionTitle",
DROP COLUMN "projectSubtitle",
DROP COLUMN "projectTitle",
ADD COLUMN     "projectsItems" JSONB,
ADD COLUMN     "projectsSectionTitle" TEXT;
