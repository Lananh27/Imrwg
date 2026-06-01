-- CreateTable
CREATE TABLE "HomeContent" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "intro" TEXT,
    "marqueeText" TEXT,
    "meetings" JSONB,
    "attentionItems" JSONB,
    "sliderItems" JSONB,
    "infoLinks" JSONB,
    "featuredSection" JSONB,
    "mapCards" JSONB,
    "whatsNew" JSONB,
    "social" JSONB,
    "rosesCalls" JSONB,
    "rosesSelections" JSONB,
    "opportunities" JSONB,
    "globalPrograms" JSONB,
    "regionalInitiatives" JSONB,
    "earthObservationPrograms" JSONB,
    "footerContact" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeContent_slug_key" ON "HomeContent"("slug");
