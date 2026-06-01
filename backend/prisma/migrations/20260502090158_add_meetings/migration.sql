/*
  Warnings:

  - You are about to drop the `LibraryDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LibraryDocument";

-- DropTable
DROP TABLE "Meeting";

-- CreateTable
CREATE TABLE "meetings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    "image" TEXT DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'past',
    "status" TEXT NOT NULL DEFAULT 'published',
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);
