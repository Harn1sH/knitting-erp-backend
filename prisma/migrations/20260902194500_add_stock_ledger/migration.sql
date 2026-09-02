-- CreateEnum
CREATE TYPE "StockTransferType" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "YarnStockLedger" (
    "id" TEXT NOT NULL,
    "type" "StockTransferType" NOT NULL,
    "clientId" TEXT NOT NULL,
    "sourceJobCardId" TEXT,
    "targetJobCardId" TEXT,
    "linkedChallanId" TEXT,
    "yarnName" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YarnStockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YarnStockLedger_clientId_idx" ON "YarnStockLedger"("clientId");

-- CreateIndex
CREATE INDEX "YarnStockLedger_sourceJobCardId_idx" ON "YarnStockLedger"("sourceJobCardId");

-- CreateIndex
CREATE INDEX "YarnStockLedger_targetJobCardId_idx" ON "YarnStockLedger"("targetJobCardId");

-- CreateIndex
CREATE INDEX "YarnStockLedger_linkedChallanId_idx" ON "YarnStockLedger"("linkedChallanId");

-- CreateIndex
CREATE INDEX "YarnStockLedger_date_idx" ON "YarnStockLedger"("date");

-- CreateIndex
CREATE INDEX "JobCard_clientId_idx" ON "JobCard"("clientId");

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnStockLedger" ADD CONSTRAINT "YarnStockLedger_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnStockLedger" ADD CONSTRAINT "YarnStockLedger_sourceJobCardId_fkey" FOREIGN KEY ("sourceJobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnStockLedger" ADD CONSTRAINT "YarnStockLedger_targetJobCardId_fkey" FOREIGN KEY ("targetJobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnStockLedger" ADD CONSTRAINT "YarnStockLedger_linkedChallanId_fkey" FOREIGN KEY ("linkedChallanId") REFERENCES "YarnInwardChallan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
