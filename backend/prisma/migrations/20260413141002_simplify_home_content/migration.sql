/*
  Warnings:

  - You are about to drop the column `earthObservationPrograms` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `featuredSection` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `footerContact` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `globalPrograms` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `infoLinks` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `intro` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `mapCards` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `meetings` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `opportunities` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `regionalInitiatives` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `rosesCalls` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `rosesSelections` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `sliderItems` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `social` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `HomeContent` table. All the data in the column will be lost.
  - You are about to drop the column `whatsNew` on the `HomeContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeContent" DROP COLUMN "earthObservationPrograms",
DROP COLUMN "featuredSection",
DROP COLUMN "footerContact",
DROP COLUMN "globalPrograms",
DROP COLUMN "infoLinks",
DROP COLUMN "intro",
DROP COLUMN "mapCards",
DROP COLUMN "meetings",
DROP COLUMN "opportunities",
DROP COLUMN "regionalInitiatives",
DROP COLUMN "rosesCalls",
DROP COLUMN "rosesSelections",
DROP COLUMN "sliderItems",
DROP COLUMN "social",
DROP COLUMN "title",
DROP COLUMN "whatsNew",
ADD COLUMN     "footerContactText" TEXT,
ADD COLUMN     "footerMailingText" TEXT,
ADD COLUMN     "footerSocialText" TEXT,
ADD COLUMN     "headerLogo" TEXT,
ADD COLUMN     "heroButtonLink" TEXT,
ADD COLUMN     "heroButtonText" TEXT,
ADD COLUMN     "heroDescription" TEXT,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "infoItems" JSONB,
ADD COLUMN     "siteName" TEXT,
ADD COLUMN     "welcomeText" TEXT,
ADD COLUMN     "welcomeTitle" TEXT;
