/*
  Warnings:

  - You are about to drop the column `totalYarnNeeded` on the `FabricItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FabricItem" DROP COLUMN "totalYarnNeeded";

-- CreateIndex
CREATE INDEX "JobCard_createdAt_idx" ON "JobCard"("createdAt" DESC);
