/*
  Warnings:

  - You are about to drop the `DataItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DataItem";

-- CreateTable
CREATE TABLE "DataContent" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "heroImage" TEXT,
    "cards" JSONB,
    "tableRows" JSONB,
    "files" JSONB,
    "chartItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataContent_slug_key" ON "DataContent"("slug");
