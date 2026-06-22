-- CreateEnum
CREATE TYPE "FridgeItemStatus" AS ENUM ('FRESH', 'EXPIRING_SOON', 'EXPIRED');

-- CreateTable
CREATE TABLE "FridgeItem" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "storageLocation" "StorageLocation" NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "FridgeItemStatus" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FridgeItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FridgeItem" ADD CONSTRAINT "FridgeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
