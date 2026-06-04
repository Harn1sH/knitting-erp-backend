/*
  Warnings:

  - You are about to drop the `Delivery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YarnInward` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_fabricItemId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "YarnInward" DROP CONSTRAINT "YarnInward_fabricItemId_fkey";

-- DropForeignKey
ALTER TABLE "YarnInward" DROP CONSTRAINT "YarnInward_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "YarnInward" DROP CONSTRAINT "YarnInward_supplierId_fkey";

-- DropTable
DROP TABLE "Delivery";

-- DropTable
DROP TABLE "YarnInward";

-- CreateTable
CREATE TABLE "ChallanCounter" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL,

    CONSTRAINT "ChallanCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallan" (
    "id" TEXT NOT NULL,
    "dcNo" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "vehicle" TEXT,
    "companyName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryItem" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "fabricItemId" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "numberOfRolls" INTEGER,
    "weightPerRoll" DOUBLE PRECISION,
    "fabricName" TEXT,

    CONSTRAINT "DeliveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnInwardChallan" (
    "id" TEXT NOT NULL,
    "grnNo" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YarnInwardChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnInwardItem" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "fabricItemId" TEXT NOT NULL,
    "yarnName" TEXT NOT NULL,
    "color" TEXT,
    "bags" INTEGER NOT NULL,
    "cones" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "weightPerBag" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnInwardItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallanCounter_type_year_key" ON "ChallanCounter"("type", "year");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryChallan_dcNo_key" ON "DeliveryChallan"("dcNo");

-- CreateIndex
CREATE UNIQUE INDEX "YarnInwardChallan_grnNo_key" ON "YarnInwardChallan"("grnNo");

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "DeliveryChallan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInwardChallan" ADD CONSTRAINT "YarnInwardChallan_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInwardChallan" ADD CONSTRAINT "YarnInwardChallan_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInwardItem" ADD CONSTRAINT "YarnInwardItem_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "YarnInwardChallan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInwardItem" ADD CONSTRAINT "YarnInwardItem_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
