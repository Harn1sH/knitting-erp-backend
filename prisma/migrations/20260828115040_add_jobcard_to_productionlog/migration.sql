-- AlterTable
ALTER TABLE "ProductionLog" ADD COLUMN     "jobCardId" TEXT;

-- CreateIndex
CREATE INDEX "Invoice_jobCardId_idx" ON "Invoice"("jobCardId");

-- CreateIndex
CREATE INDEX "Invoice_date_idx" ON "Invoice"("date");

-- CreateIndex
CREATE INDEX "Production_jobCardId_idx" ON "Production"("jobCardId");

-- CreateIndex
CREATE INDEX "Production_operatorId_idx" ON "Production"("operatorId");

-- CreateIndex
CREATE INDEX "Production_date_idx" ON "Production"("date");

-- CreateIndex
CREATE INDEX "ProductionLog_jobCardId_idx" ON "ProductionLog"("jobCardId");

-- AddForeignKey
ALTER TABLE "ProductionLog" ADD CONSTRAINT "ProductionLog_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
