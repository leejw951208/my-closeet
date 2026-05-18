/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pinHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('SIGNUP', 'RESET', 'PHONE_CHANGE');

-- CreateEnum
CREATE TYPE "ItemBatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ItemBatchItemStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "provider",
ADD COLUMN     "lastSignInAt" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "pinFailedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinHash" TEXT NOT NULL,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3);

-- DropEnum
DROP TYPE "AuthProvider";

-- CreateTable
CREATE TABLE "OtpRequest" (
    "id" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "verifyAttempts" INTEGER NOT NULL DEFAULT 0,
    "sessionConsumedAt" TIMESTAMP(3),

    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lookupKey" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneChangeLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "oldPhone" TEXT NOT NULL,
    "newPhone" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinResetLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinResetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemBatch" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "idempotencyKey" TEXT,
    "total" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "status" "ItemBatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ItemBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemBatchItem" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "objectKey" TEXT NOT NULL,
    "status" "ItemBatchItemStatus" NOT NULL DEFAULT 'PENDING',
    "itemId" UUID,
    "error" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemBatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpRequest_phoneNumber_createdAt_idx" ON "OtpRequest"("phoneNumber", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_lookupKey_key" ON "RefreshToken"("lookupKey");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "ItemBatch_userId_status_idx" ON "ItemBatch"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ItemBatch_userId_idempotencyKey_key" ON "ItemBatch"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ItemBatchItem_batchId_status_idx" ON "ItemBatchItem"("batchId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneChangeLog" ADD CONSTRAINT "PhoneChangeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinResetLog" ADD CONSTRAINT "PinResetLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemBatch" ADD CONSTRAINT "ItemBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemBatchItem" ADD CONSTRAINT "ItemBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ItemBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
