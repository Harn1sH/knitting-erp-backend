/*
  Warnings:

  - You are about to drop the column `phone` on the `Supplier` table. All the data in the column will be lost.
  - Added the required column `remarks` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "phone",
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "altPhoneNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "remarks" TEXT NOT NULL;
