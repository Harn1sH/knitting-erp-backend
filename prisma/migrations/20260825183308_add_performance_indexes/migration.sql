-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Client_isActive_idx" ON "Client"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryChallan_jobCardId_idx" ON "DeliveryChallan"("jobCardId");

-- CreateIndex
CREATE INDEX "DeliveryChallan_invoiceId_idx" ON "DeliveryChallan"("invoiceId");

-- CreateIndex
CREATE INDEX "DeliveryChallan_date_idx" ON "DeliveryChallan"("date");

-- CreateIndex
CREATE INDEX "DeliveryItem_challanId_idx" ON "DeliveryItem"("challanId");

-- CreateIndex
CREATE INDEX "DeliveryItem_fabricItemId_idx" ON "DeliveryItem"("fabricItemId");

-- CreateIndex
CREATE INDEX "FabricItem_jobCardId_idx" ON "FabricItem"("jobCardId");

-- CreateIndex
CREATE INDEX "MasterEntry_category_idx" ON "MasterEntry"("category");

-- CreateIndex
CREATE INDEX "MasterEntry_name_idx" ON "MasterEntry"("name");

-- CreateIndex
CREATE INDEX "ProductionLog_employeeId_idx" ON "ProductionLog"("employeeId");

-- CreateIndex
CREATE INDEX "ProductionLog_date_idx" ON "ProductionLog"("date");

-- CreateIndex
CREATE INDEX "ProductionLog_shift_idx" ON "ProductionLog"("shift");

-- CreateIndex
CREATE INDEX "YarnInwardChallan_jobCardId_idx" ON "YarnInwardChallan"("jobCardId");

-- CreateIndex
CREATE INDEX "YarnInwardChallan_supplierId_idx" ON "YarnInwardChallan"("supplierId");

-- CreateIndex
CREATE INDEX "YarnInwardChallan_entryDate_idx" ON "YarnInwardChallan"("entryDate");

-- CreateIndex
CREATE INDEX "YarnInwardItem_challanId_idx" ON "YarnInwardItem"("challanId");

-- CreateIndex
CREATE INDEX "YarnInwardItem_fabricItemId_idx" ON "YarnInwardItem"("fabricItemId");

-- CreateIndex
CREATE INDEX "YarnInwardItem_supplierId_idx" ON "YarnInwardItem"("supplierId");

-- CreateIndex
CREATE INDEX "YarnReturn_jobCardId_idx" ON "YarnReturn"("jobCardId");

-- CreateIndex
CREATE INDEX "YarnReturn_supplierId_idx" ON "YarnReturn"("supplierId");

-- CreateIndex
CREATE INDEX "YarnReturn_date_idx" ON "YarnReturn"("date");

-- CreateIndex
CREATE INDEX "YarnReturnItem_yarnReturnId_idx" ON "YarnReturnItem"("yarnReturnId");

-- CreateIndex
CREATE INDEX "YarnReturnItem_fabricItemId_idx" ON "YarnReturnItem"("fabricItemId");
