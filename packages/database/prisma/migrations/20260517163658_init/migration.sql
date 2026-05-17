-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('KAKAO', 'APPLE', 'EMAIL');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'OUTER', 'SHOES', 'HAT', 'BAG', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL');

-- CreateEnum
CREATE TYPE "OutfitSource" AS ENUM ('MANUAL', 'SHUFFLE', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "OutfitSlot" AS ENUM ('TOP', 'BOTTOM', 'OUTER', 'SHOES');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "provider" "AuthProvider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Closet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Closet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "closetId" UUID NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "emoji" TEXT,
    "colorHex" TEXT,
    "brand" TEXT,
    "season" "Season",
    "aiConfidence" DOUBLE PRECISION,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "OutfitSource" NOT NULL DEFAULT 'MANUAL',
    "slotsFilled" INTEGER NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "outfitId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "slot" "OutfitSlot" NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfitId","slot")
);

-- CreateTable
CREATE TABLE "CalendarEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "outfitId" UUID NOT NULL,
    "wornDate" DATE NOT NULL,

    CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Closet_userId_key" ON "Closet"("userId");

-- CreateIndex
CREATE INDEX "Item_closetId_category_idx" ON "Item"("closetId", "category");

-- CreateIndex
CREATE INDEX "Outfit_userId_createdAt_idx" ON "Outfit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OutfitItem_itemId_idx" ON "OutfitItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEntry_userId_wornDate_key" ON "CalendarEntry"("userId", "wornDate");

-- AddForeignKey
ALTER TABLE "Closet" ADD CONSTRAINT "Closet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_closetId_fkey" FOREIGN KEY ("closetId") REFERENCES "Closet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
