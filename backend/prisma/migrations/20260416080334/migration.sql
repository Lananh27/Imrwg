-- AlterTable
ALTER TABLE "HomeContent" ADD COLUMN     "footerLogo" TEXT;

-- CreateTable
CREATE TABLE "Attention" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Attention_pkey" PRIMARY KEY ("id")
);
