-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "EducationContent" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "heroBadge" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroDescription" TEXT,
    "heroImage" TEXT,
    "stats" JSONB,
    "featuredPrograms" JSONB,
    "resourceItems" JSONB,
    "timelineItems" JSONB,
    "ctaTitle" TEXT,
    "ctaDescription" TEXT,
    "ctaButtonText" TEXT,
    "ctaButtonLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT,
    "unit" TEXT,
    "fileUrl" TEXT,
    "imageUrl" TEXT,
    "year" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EducationContent_slug_key" ON "EducationContent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DataItem_slug_key" ON "DataItem"("slug");
