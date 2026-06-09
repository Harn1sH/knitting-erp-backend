/*
  Warnings:

  - Added the required column `rolls` to the `DeliveryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wtPerRoll` to the `DeliveryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeliveryItem" ADD COLUMN     "rolls" INTEGER NOT NULL,
ADD COLUMN     "wtPerRoll" DOUBLE PRECISION NOT NULL;
