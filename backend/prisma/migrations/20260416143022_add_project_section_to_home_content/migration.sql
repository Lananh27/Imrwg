/*
  Warnings:

  - You are about to drop the `Attention` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "HomeContent" ADD COLUMN     "projectBullets" JSONB,
ADD COLUMN     "projectDescription" TEXT,
ADD COLUMN     "projectImage" TEXT,
ADD COLUMN     "projectReadMoreLink" TEXT,
ADD COLUMN     "projectSectionTitle" TEXT,
ADD COLUMN     "projectSubtitle" TEXT,
ADD COLUMN     "projectTitle" TEXT;

-- DropTable
DROP TABLE "Attention";
