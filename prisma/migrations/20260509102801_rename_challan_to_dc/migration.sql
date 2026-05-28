/*
  Warnings:

  - You are about to drop the column `challanNo` on the `Delivery` table. All the data in the column will be lost.
  - Added the required column `dcNo` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "challanNo",
ADD COLUMN     "dcNo" TEXT NOT NULL;
