/*
  Warnings:

  - You are about to drop the column `supplier` on the `YarnInward` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `YarnInward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YarnInward" DROP COLUMN "supplier",
ADD COLUMN     "supplierId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_gstNumber_key" ON "Supplier"("gstNumber");

-- AddForeignKey
ALTER TABLE "YarnInward" ADD CONSTRAINT "YarnInward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
