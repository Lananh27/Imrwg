-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'International Mekong Research Working Group (IMRWG)',
    "mainLogo" TEXT,
    "subLogo1" TEXT,
    "subLogo2" TEXT,
    "subLogo3" TEXT,
    "subLogo4" TEXT,
    "centerImage" TEXT,
    "footerTitle" TEXT,
    "footerDescription" TEXT,
    "footerAddress" TEXT,
    "footerEmail" TEXT,
    "footerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeInfoItem" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeInfoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);
