/*
  Warnings:

  - You are about to drop the column `quantityKg` on the `JobCard` table. All the data in the column will be lost.
  - Added the required column `brand` to the `JobCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fabricType` to the `JobCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machine` to the `JobCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineNote` to the `JobCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderQuantity` to the `JobCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobCard" DROP COLUMN "quantityKg",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "fabricType" TEXT NOT NULL,
ADD COLUMN     "machine" TEXT NOT NULL,
ADD COLUMN     "machineNote" TEXT NOT NULL,
ADD COLUMN     "orderQuantity" DOUBLE PRECISION NOT NULL;
