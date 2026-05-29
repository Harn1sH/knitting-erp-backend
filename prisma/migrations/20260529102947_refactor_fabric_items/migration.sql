/*
  Warnings:

  - You are about to drop the column `composition` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `dia` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `fabricType` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `gsm` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `mill` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `orderQuantity` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `JobCard` table. All the data in the column will be lost.
  - You are about to drop the column `totalYarnNeeded` on the `JobCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobCard" DROP COLUMN "composition",
DROP COLUMN "count",
DROP COLUMN "dia",
DROP COLUMN "fabricType",
DROP COLUMN "gsm",
DROP COLUMN "mill",
DROP COLUMN "orderQuantity",
DROP COLUMN "quality",
DROP COLUMN "rate",
DROP COLUMN "totalYarnNeeded";

-- CreateTable
CREATE TABLE "FabricItem" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "gsm" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "count" TEXT NOT NULL,
    "composition" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "mill" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "orderQuantity" DOUBLE PRECISION NOT NULL,
    "totalYarnNeeded" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FabricItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FabricItem" ADD CONSTRAINT "FabricItem_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
