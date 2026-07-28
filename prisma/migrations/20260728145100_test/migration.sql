/*
  Warnings:

  - You are about to drop the column `deliveryDate` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `cones` on the `YarnInwardItem` table. All the data in the column will be lost.
  - You are about to drop the column `wtPerCone` on the `YarnInwardItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "YarnInwardItem" DROP CONSTRAINT "YarnInwardItem_fabricItemId_fkey";

-- AlterTable
ALTER TABLE "DeliveryItem" ADD COLUMN     "dia" TEXT;

-- AlterTable
ALTER TABLE "JobCard" DROP COLUMN "deliveryDate",
ADD COLUMN     "jobReceivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "YarnInwardItem" DROP COLUMN "cones",
DROP COLUMN "wtPerCone",
ADD COLUMN     "customFabricItem" TEXT,
ALTER COLUMN "fabricItemId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fabricType" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "rollsCompleted" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YarnInwardItem" ADD CONSTRAINT "YarnInwardItem_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionLog" ADD CONSTRAINT "ProductionLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
