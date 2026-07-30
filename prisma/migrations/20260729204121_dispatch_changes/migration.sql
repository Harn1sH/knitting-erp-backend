/*
  Warnings:

  - You are about to drop the column `weightPerRoll` on the `DeliveryItem` table. All the data in the column will be lost.
  - You are about to drop the column `wtPerRoll` on the `DeliveryItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeliveryItem" DROP CONSTRAINT "DeliveryItem_fabricItemId_fkey";

-- AlterTable
ALTER TABLE "DeliveryItem" DROP COLUMN "weightPerRoll",
DROP COLUMN "wtPerRoll",
ALTER COLUMN "fabricItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
